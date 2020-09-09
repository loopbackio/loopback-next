// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  ApplicationConfig,
  Binding,
  BindingAddress,
  Constructor,
  Context,
  Provider,
  Server,
} from '@loopback/core';
import {
  ExpressMiddlewareFactory,
  ExpressRequestHandler,
  Middleware,
  MiddlewareBindingOptions,
} from '@loopback/express';
import {OpenApiSpec, OperationObject} from '@loopback/openapi-v3';
import {PathParams} from 'express-serve-static-core';
import {ServeStaticOptions} from 'serve-static';
import {format} from 'util';
import {BodyParser} from './body-parsers';
import {RestBindings} from './keys';
import {RestComponent} from './rest.component';
import {HttpRequestListener, HttpServerLike, RestServer} from './rest.server';
import {ControllerClass, ControllerFactory, RouteEntry} from './router';
import {RouterSpec} from './router/router-spec';
import {SequenceFunction, SequenceHandler} from './sequence';

export const ERR_NO_MULTI_SERVER = format(
  'RestApplication does not support multiple servers!',
  'To create your own server bindings, please extend the Application class.',
);

// To help cut down on verbosity!
export const SequenceActions = RestBindings.SequenceActions;

/**
 * An implementation of the Application class that automatically provides
 * an instance of a REST server. This application class is intended to be
 * a single-server implementation. Any attempt to bind additional servers
 * will throw an error.
 *
 */
export class RestApplication extends Application implements HttpServerLike {
  /**
   * The main REST server instance providing REST API for this application.
   */
  get restServer(): RestServer {
    // FIXME(kjdelisle): I attempted to mimic the pattern found in RestServer
    // with no success, so until I've got a better way, this is functional.
    return this.getSync<RestServer>('servers.RestServer');
  }

  /**
   * Handle incoming HTTP(S) request by invoking the corresponding
   * Controller method via the configured Sequence.
   *
   * @example
   *
   * ```ts
   * const app = new RestApplication();
   * // setup controllers, etc.
   *
   * const server = http.createServer(app.requestHandler);
   * server.listen(3000);
   * ```
   *
   * @param req - The request.
   * @param res - The response.
   */
  get requestHandler(): HttpRequestListener {
    return this.restServer.requestHandler;
  }

  /**
   * Create a REST application with the given parent context
   * @param parent - Parent context
   */
  constructor(parent: Context);
  /**
   * Create a REST application with the given configuration and parent context
   * @param config - Application configuration
   * @param parent - Parent context
   */
  constructor(config?: ApplicationConfig, parent?: Context);

  constructor(configOrParent?: ApplicationConfig | Context, parent?: Context) {
    super(configOrParent, parent);
    this.component(RestComponent);
  }

  server(server: Constructor<Server>, name?: string): Binding {
    if (this.findByTag('server').length > 0) {
      throw new Error(ERR_NO_MULTI_SERVER);
    }
    return super.server(server, name);
  }

  sequence(sequence: Constructor<SequenceHandler>): Binding {
    return this.restServer.sequence(sequence);
  }

  handler(handlerFn: SequenceFunction) {
    this.restServer.handler(handlerFn);
  }

  /**
   * Mount static assets to the REST server.
   * See https://expressjs.com/en/4x/api.html#express.static
   * @param path - The path(s) to serve the asset.
   * See examples at https://expressjs.com/en/4x/api.html#path-examples
   * To avoid performance penalty, `/` is not allowed for now.
   * @param rootDir - The root directory from which to serve static assets
   * @param options - Options for serve-static
   */
  static(path: PathParams, rootDir: string, options?: ServeStaticOptions) {
    this.restServer.static(path, rootDir, options);
  }

  /**
   * Bind a body parser to the server context
   * @param parserClass - Body parser class
   * @param address - Optional binding address
   */
  bodyParser(
    bodyParserClass: Constructor<BodyParser>,
    address?: BindingAddress<BodyParser>,
  ): Binding<BodyParser> {
    return this.restServer.bodyParser(bodyParserClass, address);
  }

  /**
   * Configure the `basePath` for the rest server
   * @param path - Base path
   */
  basePath(path = '') {
    this.restServer.basePath(path);
  }

  /**
   * Bind an Express middleware to this server context
   *
   * @example
   * ```ts
   * import myExpressMiddlewareFactory from 'my-express-middleware';
   * const myExpressMiddlewareConfig= {};
   * const myExpressMiddleware = myExpressMiddlewareFactory(myExpressMiddlewareConfig);
   * server.expressMiddleware('middleware.express.my', myExpressMiddleware);
   * ```
   * @param key - Middleware binding key
   * @param middleware - Express middleware handler function(s)
   *
   */
  expressMiddleware(
    key: BindingAddress,
    middleware: ExpressRequestHandler | ExpressRequestHandler[],
    options?: MiddlewareBindingOptions,
  ): Binding<Middleware>;

  /**
   * Bind an Express middleware to this server context
   *
   * @example
   * ```ts
   * import myExpressMiddlewareFactory from 'my-express-middleware';
   * const myExpressMiddlewareConfig= {};
   * server.expressMiddleware(myExpressMiddlewareFactory, myExpressMiddlewareConfig);
   * ```
   * @param middlewareFactory - Middleware module name or factory function
   * @param middlewareConfig - Middleware config
   * @param options - Options for registration
   *
   * @typeParam CFG - Configuration type
   */
  expressMiddleware<CFG>(
    middlewareFactory: ExpressMiddlewareFactory<CFG>,
    middlewareConfig?: CFG,
    options?: MiddlewareBindingOptions,
  ): Binding<Middleware>;

  expressMiddleware<CFG>(
    factoryOrKey: ExpressMiddlewareFactory<CFG> | BindingAddress<Middleware>,
    configOrHandlers: CFG | ExpressRequestHandler | ExpressRequestHandler[],
    options: MiddlewareBindingOptions = {},
  ): Binding<Middleware> {
    return this.restServer.expressMiddleware(
      factoryOrKey,
      configOrHandlers,
      options,
    );
  }

  /**
   * Register a middleware function or provider class
   *
   * @example
   * ```ts
   * const log: Middleware = async (requestCtx, next) {
   *   // ...
   * }
   * server.middleware(log);
   * ```
   *
   * @param middleware - Middleware function or provider class
   * @param options - Middleware binding options
   */
  middleware(
    middleware: Middleware | Constructor<Provider<Middleware>>,
    options: MiddlewareBindingOptions = {},
  ): Binding<Middleware> {
    return this.restServer.middleware(middleware, options);
  }

  /**
   * Register a new Controller-based route.
   *
   * @example
   * ```ts
   * class MyController {
   *   greet(name: string) {
   *     return `hello ${name}`;
   *   }
   * }
   * app.route('get', '/greet', operationSpec, MyController, 'greet');
   * ```
   *
   * @param verb - HTTP verb of the endpoint
   * @param path - URL path of the endpoint
   * @param spec - The OpenAPI spec describing the endpoint (operation)
   * @param controllerCtor - Controller constructor
   * @param controllerFactory - A factory function to create controller instance
   * @param methodName - The name of the controller method
   */
  route<T>(
    verb: string,
    path: string,
    spec: OperationObject,
    controllerCtor: ControllerClass<T>,
    controllerFactory: ControllerFactory<T>,
    methodName: string,
  ): Binding;

  /**
   * Register a new route invoking a handler function.
   *
   * @example
   * ```ts
   * function greet(name: string) {
   *  return `hello ${name}`;
   * }
   * app.route('get', '/', operationSpec, greet);
   * ```
   *
   * @param verb - HTTP verb of the endpoint
   * @param path - URL path of the endpoint
   * @param spec - The OpenAPI spec describing the endpoint (operation)
   * @param handler - The function to invoke with the request parameters
   * described in the spec.
   */
  route(
    verb: string,
    path: string,
    spec: OperationObject,
    handler: Function,
  ): Binding;

  /**
   * Register a new route.
   *
   * @example
   * ```ts
   * function greet(name: string) {
   *  return `hello ${name}`;
   * }
   * const route = new Route('get', '/', operationSpec, greet);
   * app.route(route);
   * ```
   *
   * @param route - The route to add.
   */
  route(route: RouteEntry): Binding;

  /**
   * Register a new route.
   *
   * @example
   * ```ts
   * function greet(name: string) {
   *  return `hello ${name}`;
   * }
   * app.route('get', '/', operationSpec, greet);
   * ```
   */
  route(
    verb: string,
    path: string,
    spec: OperationObject,
    handler: Function,
  ): Binding;

  route<T>(
    routeOrVerb: RouteEntry | string,
    path?: string,
    spec?: OperationObject,
    controllerCtorOrHandler?: ControllerClass<T> | Function,
    controllerFactory?: ControllerFactory<T>,
    methodName?: string,
  ): Binding {
    const server = this.restServer;
    if (typeof routeOrVerb === 'object') {
      return server.route(routeOrVerb);
    } else if (arguments.length === 4) {
      return server.route(
        routeOrVerb,
        path!,
        spec!,
        controllerCtorOrHandler as Function,
      );
    } else {
      return server.route(
        routeOrVerb,
        path!,
        spec!,
        controllerCtorOrHandler as ControllerClass<T>,
        controllerFactory!,
        methodName!,
      );
    }
  }

  /**
   * Register a route redirecting callers to a different URL.
   *
   * @example
   * ```ts
   * app.redirect('/explorer', '/explorer/');
   * ```
   *
   * @param fromPath - URL path of the redirect endpoint
   * @param toPathOrUrl - Location (URL path or full URL) where to redirect to.
   * If your server is configured with a custom `basePath`, then the base path
   * is prepended to the target location.
   * @param statusCode - HTTP status code to respond with,
   *   defaults to 303 (See Other).
   */
  redirect(
    fromPath: string,
    toPathOrUrl: string,
    statusCode?: number,
  ): Binding {
    return this.restServer.redirect(fromPath, toPathOrUrl, statusCode);
  }

  /**
   * Set the OpenAPI specification that defines the REST API schema for this
   * application. All routes, parameter definitions and return types will be
   * defined in this way.
   *
   * Note that this will override any routes defined via decorators at the
   * controller level (this function takes precedent).
   *
   * @param spec - The OpenAPI specification, as an object.
   * @returns Binding for the api spec
   */
  api(spec: OpenApiSpec): Binding {
    return this.restServer.bind(RestBindings.API_SPEC).to(spec);
  }

  /**
   * Mount an Express router to expose additional REST endpoints handled
   * via legacy Express-based stack.
   *
   * @param basePath - Path where to mount the router at, e.g. `/` or `/api`.
   * @param router - The Express router to handle the requests.
   * @param spec - A partial OpenAPI spec describing endpoints provided by the
   * router. LoopBack will prepend `basePath` to all endpoints automatically.
   * This argument is optional. You can leave it out if you don't want to
   * document the routes.
   */
  mountExpressRouter(
    basePath: string,
    router: ExpressRequestHandler,
    spec?: RouterSpec,
  ): void {
    this.restServer.mountExpressRouter(basePath, router, spec);
  }

  /**
   * Export the OpenAPI spec to the given json or yaml file
   * @param outFile - File name for the spec. The extension of the file
   * determines the format of the file.
   * - `yaml` or `yml`: YAML
   * - `json` or other: JSON
   * If the outFile is not provided or its value is `''` or `'-'`, the spec is
   * written to the console using the `log` function.
   * @param log - Log function, default to `console.log`
   */
  async exportOpenApiSpec(outFile = '', log = console.log): Promise<void> {
    return this.restServer.exportOpenApiSpec(outFile, log);
  }
}
