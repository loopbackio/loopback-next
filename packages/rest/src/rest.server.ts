// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  Constructor,
  Context,
  inject,
  BindingScope,
  BindingAddress,
} from '@loopback/context';
import {Application, CoreBindings, Server} from '@loopback/core';
import {HttpServer, HttpServerOptions} from '@loopback/http-server';
import {getControllerSpec} from '@loopback/openapi-v3';
import {
  OpenApiSpec,
  OperationObject,
  ServerObject,
} from '@loopback/openapi-v3-types';
import {AssertionError} from 'assert';
import * as cors from 'cors';
import * as debugFactory from 'debug';
import * as express from 'express';
import {PathParams} from 'express-serve-static-core';
import {IncomingMessage, ServerResponse} from 'http';
import {ServerOptions} from 'https';
import {safeDump} from 'js-yaml';
import {ServeStaticOptions} from 'serve-static';
import {BodyParser, REQUEST_BODY_PARSER_TAG} from './body-parsers';
import {HttpHandler} from './http-handler';
import {RestBindings} from './keys';
import {RequestContext} from './request-context';
import {
  ControllerClass,
  ControllerFactory,
  ControllerInstance,
  ControllerRoute,
  createControllerFactoryForBinding,
  Route,
  RouteEntry,
  RoutingTable,
  StaticAssetsRoute,
} from './router';
import {DefaultSequence, SequenceFunction, SequenceHandler} from './sequence';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  Request,
  Response,
  Send,
} from './types';

const debug = debugFactory('loopback:rest:server');

export type HttpRequestListener = (
  req: IncomingMessage,
  res: ServerResponse,
) => void;

export interface HttpServerLike {
  requestHandler: HttpRequestListener;
}

const SequenceActions = RestBindings.SequenceActions;

// NOTE(bajtos) we cannot use `import * as cloneDeep from 'lodash/cloneDeep'
// because it produces the following TypeScript error:
//  Module '"(...)/node_modules/@types/lodash/cloneDeep/index"' resolves to
//  a non-module entity and cannot be imported using this construct.
const cloneDeep: <T>(value: T) => T = require('lodash/cloneDeep');

/**
 * A REST API server for use with Loopback.
 * Add this server to your application by importing the RestComponent.
 * ```ts
 * const app = new MyApplication();
 * app.component(RestComponent);
 * ```
 *
 * To add additional instances of RestServer to your application, use the
 * `.server` function:
 * ```ts
 * app.server(RestServer, 'nameOfYourServer');
 * ```
 *
 * By default, one instance of RestServer will be created when the RestComponent
 * is bootstrapped. This instance can be retrieved with
 * `app.getServer(RestServer)`, or by calling `app.get('servers.RestServer')`
 * Note that retrieving other instances of RestServer must be done using the
 * server's name:
 * ```ts
 * const server = await app.getServer('foo')
 * // OR
 * const server = await app.get('servers.foo');
 * ```
 *
 * @export
 * @class RestServer
 * @extends {Context}
 * @implements {Server}
 */
export class RestServer extends Context implements Server, HttpServerLike {
  /**
   * Handle incoming HTTP(S) request by invoking the corresponding
   * Controller method via the configured Sequence.
   *
   * @example
   *
   * ```ts
   * const app = new Application();
   * app.component(RestComponent);
   * // setup controllers, etc.
   *
   * const restServer = await app.getServer(RestServer);
   * const httpServer = http.createServer(restServer.requestHandler);
   * httpServer.listen(3000);
   * ```
   *
   * @param req The request.
   * @param res The response.
   */

  protected _requestHandler: HttpRequestListener;
  public get requestHandler(): HttpRequestListener {
    if (this._requestHandler == null) {
      this._setupRequestHandlerIfNeeded();
    }
    return this._requestHandler;
  }

  public readonly config: RestServerConfig;
  private _basePath: string;

  protected _httpHandler: HttpHandler;
  protected get httpHandler(): HttpHandler {
    this._setupHandlerIfNeeded();
    return this._httpHandler;
  }
  protected _httpServer: HttpServer | undefined;

  protected _expressApp: express.Application;

  get listening(): boolean {
    return this._httpServer ? this._httpServer.listening : false;
  }

  get url(): string | undefined {
    return this._httpServer && this._httpServer.url;
  }

  /**
   * @memberof RestServer
   * Creates an instance of RestServer.
   *
   * @param {Application} app The application instance (injected via
   * CoreBindings.APPLICATION_INSTANCE).
   * @param {RestServerConfig=} config The configuration options (injected via
   * RestBindings.CONFIG).
   *
   */
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) app: Application,
    @inject(RestBindings.CONFIG, {optional: true})
    config: RestServerConfig = {},
  ) {
    super(app);

    // Can't check falsiness, 0 is a valid port.
    if (config.port == null) {
      config.port = 3000;
    }
    if (config.host == null) {
      // Set it to '' so that the http server will listen on all interfaces
      config.host = undefined;
    }

    config.openApiSpec = config.openApiSpec || {};
    config.openApiSpec.endpointMapping =
      config.openApiSpec.endpointMapping || OPENAPI_SPEC_MAPPING;

    config.apiExplorer = normalizeApiExplorerConfig(config.apiExplorer);

    this.config = config;
    this.bind(RestBindings.PORT).to(config.port);
    this.bind(RestBindings.HOST).to(config.host);
    this.bind(RestBindings.PROTOCOL).to(config.protocol || 'http');
    this.bind(RestBindings.HTTPS_OPTIONS).to(config as ServerOptions);

    if (config.sequence) {
      this.sequence(config.sequence);
    }

    this.basePath(config.basePath);

    this.bind(RestBindings.BASE_PATH).toDynamicValue(() => this._basePath);
    this.bind(RestBindings.HANDLER).toDynamicValue(() => this.httpHandler);
  }

  protected _setupRequestHandlerIfNeeded() {
    if (this._expressApp) return;
    this._expressApp = express();
    this._expressApp.set('query parser', 'extended');
    this._requestHandler = this._expressApp;

    // Allow CORS support for all endpoints so that users
    // can test with online SwaggerUI instance
    const corsOptions = this.config.cors || {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      maxAge: 86400,
      credentials: true,
    };
    this._expressApp.use(cors(corsOptions));

    // Set up endpoints for OpenAPI spec/ui
    this._setupOpenApiSpecEndpoints();

    // Mount our router & request handler
    this._expressApp.use(this._basePath, (req, res, next) => {
      this._handleHttpRequest(req, res).catch(next);
    });

    // Mount our error handler
    this._expressApp.use(
      (err: Error, req: Request, res: Response, next: Function) => {
        this._onUnhandledError(req, res, err);
      },
    );
  }

  /**
   * Mount /openapi.json, /openapi.yaml for specs and /swagger-ui, /explorer
   * to redirect to externally hosted API explorer
   */
  protected _setupOpenApiSpecEndpoints() {
    // NOTE(bajtos) Regular routes are handled through Sequence.
    // IMO, this built-in endpoint should not run through a Sequence,
    // because it's not part of the application API itself.
    // E.g. if the app implements access/audit logs, I don't want
    // this endpoint to trigger a log entry. If the server implements
    // content-negotiation to support XML clients, I don't want the OpenAPI
    // spec to be converted into an XML response.
    const mapping = this.config.openApiSpec!.endpointMapping!;
    // Serving OpenAPI spec
    for (const p in mapping) {
      this._expressApp.use(p, (req, res) =>
        this._serveOpenApiSpec(req, res, mapping[p]),
      );
    }

    const explorerPaths = ['/swagger-ui', '/explorer'];
    this._expressApp.get(explorerPaths, (req, res, next) =>
      this._redirectToSwaggerUI(req, res, next),
    );
  }

  protected _handleHttpRequest(request: Request, response: Response) {
    return this.httpHandler.handleRequest(request, response);
  }

  protected _setupHandlerIfNeeded() {
    // TODO(bajtos) support hot-reloading of controllers
    // after the app started. The idea is to rebuild the HttpHandler
    // instance whenever a controller was added/deleted.
    // See https://github.com/strongloop/loopback-next/issues/433
    if (this._httpHandler) return;

    /**
     * Check if there is custom router in the context
     */
    const router = this.getSync(RestBindings.ROUTER, {optional: true});
    const routingTable = new RoutingTable(router, this._staticAssetRoute);

    this._httpHandler = new HttpHandler(this, routingTable);
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
        debug('Skipping controller %s - no API spec provided', controllerName);
        continue;
      }

      debug('Registering controller %s', controllerName);
      if (apiSpec.components && apiSpec.components.schemas) {
        this._httpHandler.registerApiDefinitions(apiSpec.components.schemas);
      }
      const controllerFactory = createControllerFactoryForBinding(b.key);
      this._httpHandler.registerController(apiSpec, ctor, controllerFactory);
    }

    for (const b of this.find('routes.*')) {
      // TODO(bajtos) should we support routes defined asynchronously?
      const route = this.getSync<RouteEntry>(b.key);
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

      const controllerFactory = createControllerFactoryForBinding(b.key);
      const route = new ControllerRoute(
        verb,
        path,
        spec,
        ctor,
        controllerFactory,
      );
      this._httpHandler.registerRoute(route);
      return;
    }

    throw new Error(
      `There is no handler configured for operation "${verb} ${path}`,
    );
  }

  private async _serveOpenApiSpec(
    request: Request,
    response: Response,
    specForm?: OpenApiSpecForm,
  ) {
    specForm = specForm || {version: '3.0.0', format: 'json'};
    let specObj = this.getApiSpec();
    if (this.config.openApiSpec!.setServersFromRequest) {
      specObj = Object.assign({}, specObj);
      specObj.servers = [{url: this._getUrlForClient(request)}];
    }

    if (specObj.servers && this._basePath) {
      for (const s of specObj.servers) {
        // Update the default server url to honor `basePath`
        if (s.url === '/') {
          s.url = this._basePath;
        }
      }
    }

    if (specForm.format === 'json') {
      const spec = JSON.stringify(specObj, null, 2);
      response.setHeader('content-type', 'application/json; charset=utf-8');
      response.end(spec, 'utf-8');
    } else {
      const yaml = safeDump(specObj, {});
      response.setHeader('content-type', 'text/yaml; charset=utf-8');
      response.end(yaml, 'utf-8');
    }
  }

  /**
   * Get the protocol for a request
   * @param request Http request
   */
  private _getProtocolForRequest(request: Request) {
    return (
      (request.get('x-forwarded-proto') || '').split(',')[0] ||
      request.protocol ||
      this.config.protocol ||
      'http'
    );
  }

  /**
   * Parse the host:port string into an object for host and port
   * @param host The host string
   */
  private _parseHostAndPort(host: string | undefined) {
    host = host || '';
    host = host.split(',')[0];
    const portPattern = /:([0-9]+)$/;
    const port = (host.match(portPattern) || [])[1] || '';
    host = host.replace(portPattern, '');
    return {host, port};
  }

  /**
   * Get the URL of the request sent by the client
   * @param request Http request
   */
  private _getUrlForClient(request: Request) {
    const protocol = this._getProtocolForRequest(request);
    // The host can be in one of the forms
    // [::1]:3000
    // [::1]
    // 127.0.0.1:3000
    // 127.0.0.1
    let {host, port} = this._parseHostAndPort(
      request.get('x-forwarded-host') || request.headers.host,
    );

    const forwardedPort = (request.get('x-forwarded-port') || '').split(',')[0];
    port = forwardedPort || port;

    if (!host) {
      // No host detected from http headers. Use the configured values
      host = this.config.host!;
      port = this.config.port == null ? '' : this.config.port.toString();
    }

    // clear default ports
    port = protocol === 'https' && port === '443' ? '' : port;
    port = protocol === 'http' && port === '80' ? '' : port;

    // add port number of present
    host += port !== '' ? ':' + port : '';

    return protocol + '://' + host + this._basePath;
  }

  private async _redirectToSwaggerUI(
    request: Request,
    response: Response,
    next: express.NextFunction,
  ) {
    const config = this.config.apiExplorer!;

    if (config.disabled) {
      debug('Redirect to swagger-ui was disabled by configuration.');
      next();
      return;
    }

    debug('Redirecting to swagger-ui from %j.', request.originalUrl);
    const protocol = this._getProtocolForRequest(request);
    const baseUrl = protocol === 'http' ? config.httpUrl : config.url;
    const openApiUrl = `${this._getUrlForClient(request)}/openapi.json`;
    const fullUrl = `${baseUrl}?url=${openApiUrl}`;
    response.redirect(308, fullUrl);
  }

  /**
   * Register a controller class with this server.
   *
   * @param {Constructor} controllerCtor The controller class
   * (constructor function).
   * @returns {Binding} The newly created binding, you can use the reference to
   * further modify the binding, e.g. lock the value to prevent further
   * modifications.
   *
   * ```ts
   * class MyController {
   * }
   * app.controller(MyController).lock();
   * ```
   *
   */
  controller(controllerCtor: ControllerClass<ControllerInstance>): Binding {
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
   * @param controllerCtor Controller constructor
   * @param controllerFactory A factory function to create controller instance
   * @param methodName The name of the controller method
   */
  route<I>(
    verb: string,
    path: string,
    spec: OperationObject,
    controllerCtor: ControllerClass<I>,
    controllerFactory: ControllerFactory<I>,
    methodName: string,
  ): Binding;

  /**
   * Register a new route invoking a handler function.
   *
   * ```ts
   * function greet(name: string) {
   *  return `hello ${name}`;
   * }
   * app.route('get', '/', operationSpec, greet);
   * ```
   *
   * @param verb HTTP verb of the endpoint
   * @param path URL path of the endpoint
   * @param spec The OpenAPI spec describing the endpoint (operation)
   * @param handler The function to invoke with the request parameters
   * described in the spec.
   */
  route(
    verb: string,
    path: string,
    spec: OperationObject,
    handler: Function,
  ): Binding;

  /**
   * Register a new generic route.
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

  route<T>(
    routeOrVerb: RouteEntry | string,
    path?: string,
    spec?: OperationObject,
    controllerCtorOrHandler?: ControllerClass<T> | Function,
    controllerFactory?: ControllerFactory<T>,
    methodName?: string,
  ): Binding {
    if (typeof routeOrVerb === 'object') {
      const r = routeOrVerb;
      // Encode the path to escape special chars
      const encodedPath = encodeURIComponent(r.path).replace(/\./g, '%2E');
      return this.bind(`routes.${r.verb} ${encodedPath}`)
        .to(r)
        .tag('route');
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

    if (arguments.length === 4) {
      if (!controllerCtorOrHandler) {
        throw new AssertionError({
          message: 'handler function is required for a handler-based route',
        });
      }
      return this.route(
        new Route(routeOrVerb, path, spec, controllerCtorOrHandler as Function),
      );
    }

    if (!controllerCtorOrHandler) {
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
      new ControllerRoute(
        routeOrVerb,
        path,
        spec,
        controllerCtorOrHandler as ControllerClass<T>,
        controllerFactory,
        methodName,
      ),
    );
  }

  // The route for static assets
  private _staticAssetRoute = new StaticAssetsRoute();

  /**
   * Mount static assets to the REST server.
   * See https://expressjs.com/en/4x/api.html#express.static
   * @param path The path(s) to serve the asset.
   * See examples at https://expressjs.com/en/4x/api.html#path-examples
   * @param rootDir The root directory from which to serve static assets
   * @param options Options for serve-static
   */
  static(path: PathParams, rootDir: string, options?: ServeStaticOptions) {
    this._staticAssetRoute.registerAssets(path, rootDir, options);
  }

  /**
   * Set the OpenAPI specification that defines the REST API schema for this
   * server. All routes, parameter definitions and return types will be defined
   * in this way.
   *
   * Note that this will override any routes defined via decorators at the
   * controller level (this function takes precedent).
   *
   * @param {OpenApiSpec} spec The OpenAPI specification, as an object.
   * @returns {Binding}
   * @memberof RestServer
   */
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
    const spec = this.getSync<OpenApiSpec>(RestBindings.API_SPEC);
    const defs = this.httpHandler.getApiDefinitions();

    // Apply deep clone to prevent getApiSpec() callers from
    // accidentally modifying our internal routing data
    spec.paths = cloneDeep(this.httpHandler.describeApiPaths());
    if (defs) {
      spec.components = spec.components || {};
      spec.components.schemas = cloneDeep(defs);
    }
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
   *   public async handle({response}: RequestContext) {
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
   * app.handler(({request, response}, sequence) => {
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
        @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
        @inject(SequenceActions.PARSE_PARAMS)
        protected parseParams: ParseParams,
        @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
        @inject(SequenceActions.SEND) public send: Send,
        @inject(SequenceActions.REJECT) public reject: Reject,
      ) {
        super(findRoute, parseParams, invoke, send, reject);
      }

      async handle(context: RequestContext): Promise<void> {
        await Promise.resolve(handlerFn(context, this));
      }
    }

    this.sequence(SequenceFromFunction);
  }

  /**
   * Bind a body parser to the server context
   * @param parserClass Body parser class
   * @param address Optional binding address
   */
  bodyParser(
    bodyParserClass: Constructor<BodyParser>,
    address?: BindingAddress<BodyParser>,
  ): Binding<BodyParser> {
    const binding = createBodyParserBinding(bodyParserClass, address);
    this.add(binding);
    return binding;
  }

  /**
   * Configure the `basePath` for the rest server
   * @param path Base path
   */
  basePath(path: string = '') {
    if (this._requestHandler) {
      throw new Error(
        'Base path cannot be set as the request handler has been created',
      );
    }
    // Trim leading and trailing `/`
    path = path.replace(/(^\/)|(\/$)/, '');
    if (path) path = '/' + path;
    this._basePath = path;
  }

  /**
   * Start this REST API's HTTP/HTTPS server.
   *
   * @returns {Promise<void>}
   * @memberof RestServer
   */
  async start(): Promise<void> {
    // Set up the Express app if not done yet
    this._setupRequestHandlerIfNeeded();
    // Setup the HTTP handler so that we can verify the configuration
    // of API spec, controllers and routes at startup time.
    this._setupHandlerIfNeeded();

    const port = await this.get(RestBindings.PORT);
    const host = await this.get(RestBindings.HOST);
    const protocol = await this.get(RestBindings.PROTOCOL);
    const httpsOptions = await this.get(RestBindings.HTTPS_OPTIONS);

    const serverOptions = {};
    if (protocol === 'https') Object.assign(serverOptions, httpsOptions);
    Object.assign(serverOptions, {port, host, protocol});

    this._httpServer = new HttpServer(this.requestHandler, serverOptions);

    await this._httpServer.start();

    this.bind(RestBindings.PORT).to(this._httpServer.port);
    this.bind(RestBindings.HOST).to(this._httpServer.host);
    this.bind(RestBindings.URL).to(this._httpServer.url);
    debug('RestServer listening at %s', this._httpServer.url);
  }

  /**
   * Stop this REST API's HTTP/HTTPS server.
   *
   * @returns {Promise<void>}
   * @memberof RestServer
   */
  async stop() {
    // Kill the server instance.
    if (!this._httpServer) return;
    await this._httpServer.stop();
    this._httpServer = undefined;
  }

  protected _onUnhandledError(req: Request, res: Response, err: Error) {
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

/**
 * Create a binding for the given body parser class
 * @param parserClass Body parser class
 * @param key Optional binding address
 */
export function createBodyParserBinding(
  parserClass: Constructor<BodyParser>,
  key?: BindingAddress<BodyParser>,
): Binding<BodyParser> {
  const address =
    key || `${RestBindings.REQUEST_BODY_PARSER}.${parserClass.name}`;
  return Binding.bind<BodyParser>(address)
    .toClass(parserClass)
    .inScope(BindingScope.SINGLETON)
    .tag(REQUEST_BODY_PARSER_TAG);
}

/**
 * The form of OpenAPI specs to be served
 *
 * @interface OpenApiSpecForm
 */
export interface OpenApiSpecForm {
  version?: string;
  format?: string;
}

const OPENAPI_SPEC_MAPPING: {[key: string]: OpenApiSpecForm} = {
  '/openapi.json': {version: '3.0.0', format: 'json'},
  '/openapi.yaml': {version: '3.0.0', format: 'yaml'},
};

/**
 * Options to customize how OpenAPI specs are served
 */
export interface OpenApiSpecOptions {
  /**
   * Mapping of urls to spec forms, by default:
   * ```
   * {
   *   '/openapi.json': {version: '3.0.0', format: 'json'},
   *   '/openapi.yaml': {version: '3.0.0', format: 'yaml'},
   * }
   * ```
   */
  endpointMapping?: {[key: string]: OpenApiSpecForm};

  /**
   * A flag to force `servers` to be set from the http request for the OpenAPI
   * spec
   */
  setServersFromRequest?: boolean;

  /**
   * Configure servers for OpenAPI spec
   */
  servers?: ServerObject[];
}

export interface ApiExplorerOptions {
  /**
   * URL for the hosted API explorer UI
   * default to https://loopback.io/api-explorer
   */
  url?: string;

  /**
   * URL for the API explorer served over `http` protocol to deal with mixed
   * content security imposed by browsers as the spec is exposed over `http` by
   * default.
   * See https://github.com/strongloop/loopback-next/issues/1603
   */
  httpUrl?: string;

  /**
   * Set this flag to disable the built-in redirect to externally
   * hosted API Explorer UI.
   */
  disabled?: true;
}

/**
 * Options for RestServer configuration
 */
export interface RestServerOptions {
  /**
   * Base path for API/static routes
   */
  basePath?: string;
  cors?: cors.CorsOptions;
  openApiSpec?: OpenApiSpecOptions;
  apiExplorer?: ApiExplorerOptions;
  sequence?: Constructor<SequenceHandler>;
}

/**
 * Valid configuration for the RestServer constructor.
 *
 * @export
 * @interface RestServerConfig
 */
export type RestServerConfig = RestServerOptions & HttpServerOptions;

function normalizeApiExplorerConfig(
  input: ApiExplorerOptions | undefined,
): ApiExplorerOptions {
  const config = input || {};
  const url = config.url || 'https://explorer.loopback.io';

  config.httpUrl =
    config.httpUrl || config.url || 'http://explorer.loopback.io';

  config.url = url;

  return config;
}
