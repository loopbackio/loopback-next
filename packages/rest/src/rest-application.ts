// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, ApplicationConfig, Server} from '@loopback/core';
import {RestComponent} from './rest-component';
import {SequenceHandler, SequenceFunction} from './sequence';
import {Binding, Constructor} from '@loopback/context';
import {format} from 'util';
import {RestBindings} from './keys';
import {RouteEntry, RestServer} from '.';
import {ControllerClass} from './router/routing-table';
import {OperationObject, OpenApiSpec} from '@loopback/openapi-v3-types';

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
export class RestApplication extends Application {
  constructor(config?: ApplicationConfig) {
    const cfg = Object.assign({}, config);
    super(cfg);
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
    // FIXME(kjdelisle): I attempted to mimic the pattern found in RestServer
    // with no success, so until I've got a better way, this is functional.
    const server: RestServer = this.getSync('servers.RestServer');
    server.handler(handlerFn);
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
    // FIXME(bajtos): This is a workaround based on app.handler() above
    const server: RestServer = this.getSync('servers.RestServer');
    if (typeof routeOrVerb === 'object') {
      return server.route(routeOrVerb);
    } else {
      return server.route(routeOrVerb, path!, spec!, controller!, methodName!);
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
