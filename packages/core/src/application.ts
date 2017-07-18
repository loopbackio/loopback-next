// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AssertionError} from 'assert';
import {
  Binding,
  Context,
  Constructor,
  Provider,
  inject,
} from '@loopback/context';
import {
  OpenApiSpec,
  Route,
  ParsedRequest,
  OperationObject,
  ControllerRoute,
  RouteEntry,
} from '.';
import {ServerRequest, ServerResponse, createServer} from 'http';
import {Component, mountComponent} from './component';
import {getApiSpec} from './router/metadata';
import {HttpHandler} from './http-handler';
import {writeResultToResponse} from './writer';
import {DefaultSequence, SequenceHandler, SequenceFunction} from './sequence';
import {RejectProvider} from './router/reject';
import {FindRoute, InvokeMethod, Send, Reject} from './internal-types';
import {ControllerClass} from './router/routing-table';

const debug = require('debug')('loopback:core:application');

export class Application extends Context {
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

  constructor(public options?: ApplicationOptions) {
    super();

    if (!options) options = {};

    this.bind('http.port').to(options.http ? options.http.port : 3000);
    this.api({basePath: '/', paths: {}});

    if (options.components) {
      for (const component of options.components) {
        this.component(component);
      }
    }

    this.sequence(options.sequence ? options.sequence : DefaultSequence);

    this.handleHttp = (req: ServerRequest, res: ServerResponse) => {
      try {
        this._handleHttpRequest(req, res)
          .catch(err => this._onUnhandledError(req, res, err));
      } catch (err) {
        this._onUnhandledError(req, res, err);
      }
    };

    this.bind('sequence.actions.logError').to(this._logError.bind(this));
    this.bind('sequence.actions.send').to(writeResultToResponse);
    this.bind('sequence.actions.reject').toProvider(RejectProvider);
  }

  protected _handleHttpRequest(
    request: ServerRequest,
    response: ServerResponse,
  ) {
    this._setupHandlerIfNeeded();
    return this._httpHandler.handleRequest(request, response);
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
          `The controller ${controllerName} was not bound via .toClass()`);
      }
      const apiSpec = getApiSpec(ctor);
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
    const spec: OpenApiSpec = this.getSync('api-spec');
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
      const route = new Route(verb, path, spec, handler);
      this._httpHandler.registerRoute(route);
      return;
    }

    const controllerName = spec['x-controller'];
    if (typeof controllerName === 'string') {
      const b = this.find(`controllers.${controllerName}`)[0];
      if (!b) {
        throw new Error(
          `Unknown controller ${controllerName} used by "${verb} ${path}"`);
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
      `There is no handler configured for operation "${verb} ${path}`);
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
    methodName: string): Binding;

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

    return this.route(new ControllerRoute(
      routeOrVerb,
      path,
      spec,
      controller,
      methodName));
  }

  api(spec: OpenApiSpec): Binding {
    return this.bind('api-spec').to(spec);
  }

  protected _logError(
    err: Error,
    statusCode: number,
    req: ServerRequest,
  ): void {
    console.error(
      'Unhandled error in %s %s: %s %s',
      req.method,
      req.url,
      statusCode,
      err.stack || err,
    );
  }

  /**
   * Add a component to this application.
   *
   * @param component The component to add.
   *
   * ```ts
   *
   * export class ProductComponent {
   *   controllers = [ProductController];
   *   repositories = [ProductRepo, UserRepo];
   *   providers = {
   *     [AUTHENTICATION_STRATEGY]: AuthStrategy,
   *     [AUTHORIZATION_ROLE]: Role,
   *   };
   * };
   *
   * app.component(ProductComponent);
   * ```
   */
  public component(component: Constructor<Component>) {
    const componentKey = `components.${component.name}`;
    this.bind(componentKey).toClass(component);
    const instance = this.getSync(componentKey);
    mountComponent(this, instance);
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
    this.bind('sequence').toClass(value);
  }

  /**
   * Configure a custom sequence function for handling incoming requests.
   *
   * ```ts
   * app.handler((sequence, request, response) => {
   *   sequence.send(response, 'hello world'));
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
        @inject('sequence.actions.findRoute') protected findRoute: FindRoute,
        @inject('invokeMethod') protected invoke: InvokeMethod,
        @inject('sequence.actions.send') public send: Send,
        @inject('sequence.actions.reject') public reject: Reject,
      ) {
        super(findRoute, invoke, send, reject);
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

    const httpPort = await this.get('http.port');
    const server = createServer(this.handleHttp);

    // TODO(bajtos) support httpHostname too
    // See https://github.com/strongloop/loopback-next/issues/434
    server.listen(httpPort);

    return new Promise<void>((resolve, reject) => {
      server.once('listening', () => {
        this.bind('http.port').to(server.address().port);
        resolve();
      });
      server.once('error', reject);
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

export interface ApplicationOptions {
  http?: HttpConfig;
  components?: Array<Constructor<Component>>;
  sequence?: Constructor<SequenceHandler>;
}

export interface HttpConfig {
  port: number;
}
