// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, Constructor, BindingAddress} from '@loopback/context';
import {Application, ApplicationConfig, Server} from '@loopback/core';
import {OpenApiSpec, OperationObject} from '@loopback/openapi-v3-types';
import {PathParams} from 'express-serve-static-core';
import {ServeStaticOptions} from 'serve-static';
import {format} from 'util';
import {RestBindings} from './keys';
import {RestComponent} from './rest.component';
import {HttpRequestListener, HttpServerLike, RestServer} from './rest.server';
import {ControllerClass, ControllerFactory, RouteEntry} from './router';
import {SequenceFunction, SequenceHandler} from './sequence';
import {BodyParser} from './body-parsers';

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
   * @param req The request.
   * @param res The response.
   */
  get requestHandler(): HttpRequestListener {
    return this.restServer.requestHandler;
  }

  constructor(config: ApplicationConfig = {}) {
    super(config);
    this.component(RestComponent);
  }

  server(server: Constructor<Server>, name?: string): Binding {
    if (this.findByTag('server').length > 0) {
      throw new Error(ERR_NO_MULTI_SERVER);
    }
    return super.server(server, name);
  }

  sequence(sequence: Constructor<SequenceHandler>): Binding {
    return this.bind(RestBindings.SEQUENCE).toClass(sequence);
  }

  handler(handlerFn: SequenceFunction) {
    this.restServer.handler(handlerFn);
  }

  /**
   * Mount static assets to the REST server.
   * See https://expressjs.com/en/4x/api.html#express.static
   * @param path The path(s) to serve the asset.
   * See examples at https://expressjs.com/en/4x/api.html#path-examples
   * To avoid performance penalty, `/` is not allowed for now.
   * @param rootDir The root directory from which to serve static assets
   * @param options Options for serve-static
   */
  static(path: PathParams, rootDir: string, options?: ServeStaticOptions) {
    this.restServer.static(path, rootDir, options);
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
    return this.restServer.bodyParser(bodyParserClass, address);
  }

  /**
   * Configure the `basePath` for the rest server
   * @param path Base path
   */
  basePath(path: string = '') {
    this.restServer.basePath(path);
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

  /**
   * Register a new route.
   *
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
   * Set the OpenAPI specification that defines the REST API schema for this
   * application. All routes, parameter definitions and return types will be
   * defined in this way.
   *
   * Note that this will override any routes defined via decorators at the
   * controller level (this function takes precedent).
   *
   * @param {OpenApiSpec} spec The OpenAPI specification, as an object.
   * @returns {Binding}
   */
  api(spec: OpenApiSpec): Binding {
    return this.bind(RestBindings.API_SPEC).to(spec);
  }
}
