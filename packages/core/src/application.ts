// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, Context, Constructor} from '@loopback/context';
import {Component, OpenApiSpec} from '.';
import {ServerRequest, ServerResponse} from 'http';
import {getApiSpec} from './router/metadata';
import {HttpHandler} from './http-handler';
import {Sequence} from './sequence';

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
  public handleHttp: (req: ServerRequest, res: ServerResponse) => Promise<void>;

  protected _httpHandler: HttpHandler;

  constructor(public options?: ApplicationOptions) {
    super();

    if (options && options.components) {
      for (const component of options.components) {
        // TODO(superkhau): Need to figure a way around this hack,
        //  `componentClassName.constructor.name` + `componentClassName.name`
        //  doesn't work
        const componentClassName = component.toString().split(' ')[1];
        this.bind(`component.${componentClassName}`).toClass(component);
      }
    }

    this._bindSequence();

    this.handleHttp = (req: ServerRequest, res: ServerResponse) =>
      this._handleHttpRequest(req, res);

    this.bind('logError').to(this._logError.bind(this));
  }

  protected _bindSequence(): void {
    // TODO(bajtos, ritch, superkhau) figure out how to integrate this single
    // sequence with custom sequences contributed by components
    const sequence = this.options && this.options.sequence
      ? this.options.sequence
      : Sequence;
    this.bind('sequence').toClass(sequence);
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
    if (this._httpHandler) return;

    this._httpHandler = new HttpHandler(this);
    for (const b of this.find('controllers.*')) {
      const ctor = b.valueConstructor;
      if (!ctor) {
        throw new Error(`The controller ${b.key} was not bound via .toClass()`);
      }
      const apiSpec = getApiSpec(ctor);
      this._httpHandler.registerController(b.key, apiSpec);
    }
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
  public controller<T>(controllerCtor: Constructor<T>): Binding {
    return this.bind('controllers.' + controllerCtor.name).toClass(
      controllerCtor,
    );
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
}

export interface ApplicationOptions {
  components?: Array<Constructor<Component>>;
  sequence?: Constructor<Sequence>;
}
