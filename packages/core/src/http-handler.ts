// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/context';
import {OpenApiSpec} from '@loopback/openapi-spec';
import {ServerRequest, ServerResponse} from 'http';
import {getApiSpec} from './router/metadata';
import * as HttpErrors from 'http-errors';

import {Sequence, FindRoute, InvokeMethod} from './sequence';
import {RoutingTable, parseRequestUrl} from './router/routing-table';
import {ParsedRequest} from './internal-types';

const debug = require('debug')('loopback:core:http-handler');

export class HttpHandler {
  protected _routes: RoutingTable<string> = new RoutingTable<string>();

  public handleRequest: (request: ServerRequest, response: ServerResponse) => Promise<void>;

  constructor(protected _rootContext: Context) {
    this.handleRequest = (req, res) => this._handleRequest(req, res);
  }

  registerController(name: string, spec: OpenApiSpec) {
    this._routes.registerController(name, spec);
  }

  protected async _handleRequest(request: ServerRequest, response: ServerResponse): Promise<void> {
    const parsedRequest: ParsedRequest = parseRequestUrl(request);
    const requestContext = this._createRequestContext(request, response);

    this._bindFindRoute(requestContext);

    // TODO(bajtos) bind invoke to requestContext
    const invoke: InvokeMethod = async (controllerName, method, args) => {
      const controller: { [opName: string]: Function } = await requestContext.get(controllerName);
      const result = await controller[method](...args);
      return result;
    };

    // TODO(bajtos) instantiate the Sequence via ctx.get()
    const findRoute = await requestContext.get('findRoute');
    const sequence = new Sequence(findRoute, invoke, this.logError.bind(this));
    return sequence.run(parsedRequest, response);
  }

  protected _createRequestContext(req: ServerRequest, res: ServerResponse): Context {
    const requestContext = new Context(this._rootContext);
    requestContext.bind('http.request').to(req);
    requestContext.bind('http.response').to(res);
    return requestContext;
  }

  protected _bindFindRoute(context: Context): void {
    context.bind('findRoute').toDynamicValue(() => {
      return (request: ParsedRequest) => {
        const req = context.getSync('http.request');
        const found = this._routes.find(req);
        if (!found)
          throw new HttpErrors.NotFound(`Endpoint "${req.method} ${req.path}" not found.`);

        // bind routing information to context
        const ctor = context.getBinding(found.controller).valueConstructor;
        if (!ctor)
          throw new Error(`The controller ${found.controller} was not bound via .toClass()`);
        context.bind('controller.current.ctor').to(ctor);
        context.bind('controller.current.operation').to(found.methodName);

        return found;
      };
    });
  }

  logError(err: Error, statusCode: number, req: ServerRequest): void {
    console.error('Unhandled error in %s %s: %s %s',
      req.method, req.url, statusCode, err.stack || err);
  }
}
