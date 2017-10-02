// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AssertionError} from 'assert';
const swagger2openapi = require('swagger2openapi');
import {safeDump} from 'js-yaml';
import {Binding, Context, Constructor, inject} from '@loopback/context';
import {Route, ControllerRoute, RouteEntry, ParsedRequest} from '.';
import {
  OpenApiSpec,
  createEmptyApiSpec,
  OperationObject,
} from '@loopback/openapi-spec';
import {ServerRequest, ServerResponse, createServer} from 'http';
import * as Http from 'http';
import {Application, CoreBindings, Server} from '@loopback/core';
import {getControllerSpec} from './router/metadata';
import {HttpHandler} from './http-handler';
import {DefaultSequence, SequenceHandler, SequenceFunction} from './sequence';
import {
  FindRoute,
  InvokeMethod,
  Send,
  Reject,
  ParseParams,
} from './internal-types';
import {ControllerClass} from './router/routing-table';
import {RestBindings} from './keys';

const SequenceActions = RestBindings.SequenceActions;

// NOTE(bajtos) we cannot use `import * as cloneDeep from 'lodash/cloneDeep'
// because it produces the following TypeScript error:
//  Module '"(...)/node_modules/@types/lodash/cloneDeep/index"' resolves to
//  a non-module entity and cannot be imported using this construct.
const cloneDeep: <T>(value: T) => T = require('lodash/cloneDeep');

interface OpenApiSpecOptions {
  version?: string;
  format?: string;
}

const OPENAPI_SPEC_MAPPING: {[key: string]: OpenApiSpecOptions} = {
  '/openapi.json': {version: '3.0.0', format: 'json'},
  '/openapi.yaml': {version: '3.0.0', format: 'yaml'},
  '/swagger.json': {version: '2.0', format: 'json'},
  '/swagger.yaml': {version: '2.0', format: 'yaml'},
};

export class RestServer extends Context implements Server {
  /**
   * Handle incoming HTTP(S) request by invoking the corresponding
   * Controller method via the configured Sequence.
   *
   * @example
   *
   * ```ts
   * const app = new Application();
   * // setup controllers, etc.
   *
   * const server = http.createServer(app.handleHttp);
   * server.listen(3000);
   * ```
   *
   * @param req The request.
   * @param res The response.
   */
  public handleHttp: (req: ServerRequest, res: ServerResponse) => void;

  protected _httpHandler: HttpHandler;
  protected get httpHandler(): HttpHandler {
    this._setupHandlerIfNeeded();
    return this._httpHandler;
  }
  protected _httpServer: Http.Server;

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) app: Application,
    options?: RestServerConfig,
  ) {
    super(app);

    if (!options) options = {};

    // Can't check falsiness, 0 is a valid port.
    if (options.port === null || options.port === undefined) {
      options.port = 3000;
    }
    this.bind(RestBindings.PORT).to(options.port);
    this.api(createEmptyApiSpec());

    this.sequence(options.sequence ? options.sequence : DefaultSequence);

    this.handleHttp = (req: ServerRequest, res: ServerResponse) => {
      try {
        this._handleHttpRequest(req, res).catch(err =>
          this._onUnhandledError(req, res, err),
        );
      } catch (err) {
        this._onUnhandledError(req, res, err);
      }
    };

    this.bind(RestBindings.HANDLER).toDynamicValue(() => this.httpHandler);
  }

  protected _handleHttpRequest(
    request: ServerRequest,
    response: ServerResponse,
  ) {
    // allow CORS support for all endpoints so that users
    // can test with online SwaggerUI instance
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Max-Age', '86400');

    if (
      request.method === 'GET' &&
      request.url &&
      request.url in OPENAPI_SPEC_MAPPING
    ) {
      // NOTE(bajtos) Regular routes are handled through Sequence.
      // IMO, this built-in endpoint should not run through a Sequence,
      // because it's not part of the application API itself.
      // E.g. if the app implements access/audit logs, I don't want
      // this endpoint to trigger a log entry. If the server implements
      // content-negotiation to support XML clients, I don't want the OpenAPI
      // spec to be converted into an XML response.
      const options = OPENAPI_SPEC_MAPPING[request.url];
      return this._serveOpenApiSpec(request, response, options);
    }
    if (
      request.method === 'GET' &&
      request.url &&
      request.url === '/swagger-ui'
    ) {
      return this._redirectToSwaggerUI(request, response);
    }
    return this.httpHandler.handleRequest(request, response);
  }

  protected _setupHandlerIfNeeded() {
    // TODO(bajtos) support hot-reloading of controllers
    // after the app started. The idea is to rebuild the HttpHandler
    // instance whenever a controller was added/deleted.
    // See https://github.com/strongloop/loopback-next/issues/433
    if (this._httpHandler) return;

    this._httpHandler = new HttpHandler(this);
    for (const b of this.find('controllers.*')) {
      const controllerName = b.key.replace(/^controllers\./, '');
      const ctor = b.valueConstructor;
      if (!ctor) {
        throw new Error(
          `The controller ${controllerName} was not bound via .toClass()`,
        );
      }
      const apiSpec = getControllerSpec(ctor);
      if (!apiSpec) {
        // controller methods are specified through app.api() spec
        continue;
      }
      this._httpHandler.registerController(ctor, apiSpec);
    }

    for (const b of this.find('routes.*')) {
      // TODO(bajtos) should we support routes defined asynchronously?
      const route = this.getSync(b.key);
      this._httpHandler.registerRoute(route);
    }

    // TODO(bajtos) should we support API spec defined asynchronously?
    const spec: OpenApiSpec = this.getSync(RestBindings.API_SPEC);
    for (const path in spec.paths) {
      for (const verb in spec.paths[path]) {
        const routeSpec: OperationObject = spec.paths[path][verb];
        this._setupOperation(verb, path, routeSpec);
      }
    }
  }

  private _setupOperation(verb: string, path: string, spec: OperationObject) {
    const handler = spec['x-operation'];
    if (typeof handler === 'function') {
      // Remove a field value that cannot be represented in JSON.
      // Start by creating a shallow-copy of the spec, so that we don't
      // modify the original spec object provided by user.
      spec = Object.assign({}, spec);
      delete spec['x-operation'];

      const route = new Route(verb, path, spec, handler);
      this._httpHandler.registerRoute(route);
      return;
    }

    const controllerName = spec['x-controller-name'];
    if (typeof controllerName === 'string') {
      const b = this.find(`controllers.${controllerName}`)[0];
      if (!b) {
        throw new Error(
          `Unknown controller ${controllerName} used by "${verb} ${path}"`,
        );
      }

      const ctor = b.valueConstructor;
      if (!ctor) {
        throw new Error(
          `The controller ${controllerName} was not bound via .toClass()`,
        );
      }

      const route = new ControllerRoute(verb, path, spec, ctor);
      this._httpHandler.registerRoute(route);
      return;
    }

    throw new Error(
      `There is no handler configured for operation "${verb} ${path}`,
    );
  }

  private async _serveOpenApiSpec(
    request: ServerRequest,
    response: ServerResponse,
    options?: OpenApiSpecOptions,
  ) {
    options = options || {version: '2.0', format: 'json'};
    let specObj = this.getApiSpec();
    if (options.version === '3.0.0') {
      specObj = await swagger2openapi.convertObj(specObj, {direct: true});
    }
    if (options.format === 'json') {
      const spec = JSON.stringify(specObj, null, 2);
      response.setHeader('content-type', 'application/json; charset=utf-8');
      response.end(spec, 'utf-8');
    } else {
      const yaml = safeDump(specObj, {});
      response.setHeader('content-type', 'text/yaml; charset=utf-8');
      response.end(yaml, 'utf-8');
    }
  }

  private async _redirectToSwaggerUI(
    request: ServerRequest,
    response: ServerResponse,
  ) {
    response.statusCode = 308;
    response.setHeader(
      'Location',
      'http://petstore.swagger.io/?url=' +
        'http://' +
        request.headers.host +
        '/swagger.json',
    );
    response.end();
  }

  /**
   * Register a controller class with this application.
   *
   * @param controllerCtor {Function} The controller class
   * (constructor function).
   * @return {Binding} The newly created binding, you can use the reference to
   * further modify the binding, e.g. lock the value to prevent further
   * modifications.
   *
   * ```ts
   * @spec(apiSpec)
   * class MyController {
   * }
   * app.controller(MyController).lock();
   * ```
   */
  controller(controllerCtor: ControllerClass): Binding {
    return this.bind('controllers.' + controllerCtor.name).toClass(
      controllerCtor,
    );
  }

  /**
   * Register a new Controller-based route.
   *
   * ```ts
   * class MyController {
   *   greet(name: string) {
   *     return `hello ${name}`;
   *   }
   * }
   * app.route('get', '/greet', operationSpec, MyController, 'greet');
   * ```
   *
   * @param verb HTTP verb of the endpoint
   * @param path URL path of the endpoint
   * @param spec The OpenAPI spec describing the endpoint (operation)
   * @param controller Controller constructor
   * @param methodName The name of the controller method
   */
  route(
    verb: string,
    path: string,
    spec: OperationObject,
    controller: ControllerClass,
    methodName: string,
  ): Binding;

  /**
   * Register a new route.
   *
   * ```ts
   * function greet(name: string) {
   *  return `hello ${name}`;
   * }
   * const route = new Route('get', '/', operationSpec, greet);
   * app.route(route);
   * ```
   *
   * @param route The route to add.
   */
  route(route: RouteEntry): Binding;

  route(
    routeOrVerb: RouteEntry | string,
    path?: string,
    spec?: OperationObject,
    controller?: ControllerClass,
    methodName?: string,
  ): Binding {
    if (typeof routeOrVerb === 'object') {
      const r = routeOrVerb;
      return this.bind(`routes.${r.verb} ${r.path}`).to(r);
    }

    if (!path) {
      throw new AssertionError({
        message: 'path is required for a controller-based route',
      });
    }

    if (!spec) {
      throw new AssertionError({
        message: 'spec is required for a controller-based route',
      });
    }

    if (!controller) {
      throw new AssertionError({
        message: 'controller is required for a controller-based route',
      });
    }

    if (!methodName) {
      throw new AssertionError({
        message: 'methodName is required for a controller-based route',
      });
    }

    return this.route(
      new ControllerRoute(routeOrVerb, path, spec, controller, methodName),
    );
  }

  api(spec: OpenApiSpec): Binding {
    return this.bind(RestBindings.API_SPEC).to(spec);
  }

  /**
   * Get the OpenAPI specification describing the REST API provided by
   * this application.
   *
   * This method merges operations (HTTP endpoints) from the following sources:
   *  - `app.api(spec)`
   *  - `app.controller(MyController)`
   *  - `app.route(route)`
   *  - `app.route('get', '/greet', operationSpec, MyController, 'greet')`
   */
  getApiSpec(): OpenApiSpec {
    const spec = this.getSync(RestBindings.API_SPEC);

    // Apply deep clone to prevent getApiSpec() callers from
    // accidentally modifying our internal routing data
    spec.paths = cloneDeep(this.httpHandler.describeApiPaths());

    return spec;
  }

  /**
   * Configure a custom sequence class for handling incoming requests.
   *
   * ```ts
   * class MySequence implements SequenceHandler {
   *   constructor(
   *     @inject('send) public send: Send)) {
   *   }
   *
   *   public async handle(request: ParsedRequest, response: ServerResponse) {
   *     send(response, 'hello world');
   *   }
   * }
   * ```
   *
   * @param value The sequence to invoke for each incoming request.
   */
  public sequence(value: Constructor<SequenceHandler>) {
    this.bind(RestBindings.SEQUENCE).toClass(value);
  }

  /**
   * Configure a custom sequence function for handling incoming requests.
   *
   * ```ts
   * app.handler((sequence, request, response) => {
   *   sequence.send(response, 'hello world');
   * });
   * ```
   *
   * @param handlerFn The handler to invoke for each incoming request.
   */
  public handler(handlerFn: SequenceFunction) {
    class SequenceFromFunction extends DefaultSequence {
      // NOTE(bajtos) Unfortunately, we have to duplicate the constructor
      // in order for our DI/IoC framework to inject constructor arguments
      constructor(
        @inject(RestBindings.Http.CONTEXT) public ctx: Context,
        @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
        @inject(SequenceActions.PARSE_PARAMS)
        protected parseParams: ParseParams,
        @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
        @inject(SequenceActions.SEND) public send: Send,
        @inject(SequenceActions.REJECT) public reject: Reject,
      ) {
        super(ctx, findRoute, parseParams, invoke, send, reject);
      }

      async handle(
        request: ParsedRequest,
        response: ServerResponse,
      ): Promise<void> {
        await Promise.resolve(handlerFn(this, request, response));
      }
    }

    this.sequence(SequenceFromFunction);
  }

  /**
   * Start the application (e.g. HTTP/HTTPS servers).
   */
  async start(): Promise<void> {
    // Setup the HTTP handler so that we can verify the configuration
    // of API spec, controllers and routes at startup time.
    this._setupHandlerIfNeeded();

    const httpPort = await this.get(RestBindings.PORT);
    this._httpServer = createServer(this.handleHttp);
    const httpServer = this._httpServer;

    // TODO(bajtos) support httpHostname too
    // See https://github.com/strongloop/loopback-next/issues/434
    httpServer.listen(httpPort);

    return new Promise<void>((resolve, reject) => {
      httpServer.once('listening', () => {
        this.bind(RestBindings.PORT).to(httpServer.address().port);
        resolve();
      });
      httpServer.once('error', reject);
    });
  }

  async stop() {
    // Kill the server instance.
    const server = this._httpServer;
    return new Promise<void>((resolve, reject) => {
      server.close((err: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  protected _onUnhandledError(
    req: ServerRequest,
    res: ServerResponse,
    err: Error,
  ) {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end();
    }

    // It's the responsibility of the Sequence to handle any errors.
    // If an unhandled error escaped, then something very wrong happened
    // and it's best to crash the process immediately.
    process.nextTick(() => {
      throw err;
    });
  }
}

export interface RestServerConfig {
  port?: number;
  sequence?: Constructor<SequenceHandler>;
}
