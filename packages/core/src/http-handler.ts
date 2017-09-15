// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  Context,
  ValueOrPromise,
  BoundValue,
  Constructor,
} from '@loopback/context';
import {PathsObject} from '@loopback/openapi-spec';
import {ServerRequest, ServerResponse} from 'http';
import {getControllerSpec, ControllerSpec} from './router/metadata';

import {SequenceHandler} from './sequence';
import {
  RoutingTable,
  parseRequestUrl,
  ResolvedRoute,
  RouteEntry,
  ControllerClass,
} from './router/routing-table';
import {
  FindRoute,
  InvokeMethod,
  ParsedRequest,
  OperationArgs,
} from './internal-types';
import {CoreBindings} from './keys';

const debug = require('debug')('loopback:core:http-handler');

export class HttpHandler {
  protected _routes: RoutingTable = new RoutingTable();

  public handleRequest: (
    request: ServerRequest,
    response: ServerResponse,
  ) => Promise<void>;

  constructor(protected _rootContext: Context) {
    this.handleRequest = (req, res) => this._handleRequest(req, res);
  }

  registerController(name: ControllerClass, spec: ControllerSpec) {
    this._routes.registerController(name, spec);
  }

  registerRoute(route: RouteEntry) {
    this._routes.registerRoute(route);
  }

  describeApiPaths(): PathsObject {
    return this._routes.describeApiPaths();
  }

  findRoute(request: ParsedRequest) {
    return this._routes.find(request);
  }

  protected async _handleRequest(
    request: ServerRequest,
    response: ServerResponse,
  ): Promise<void> {
    const parsedRequest: ParsedRequest = parseRequestUrl(request);
    const requestContext = this._createRequestContext(request, response);

    const sequence: SequenceHandler = await requestContext.get(
      CoreBindings.Http.SEQUENCE,
    );
    await sequence.handle(parsedRequest, response);
  }

  protected _createRequestContext(
    req: ServerRequest,
    res: ServerResponse,
  ): Context {
    const requestContext = new Context(this._rootContext);
    requestContext.bind(CoreBindings.Http.REQUEST).to(req);
    requestContext.bind(CoreBindings.Http.RESPONSE).to(res);
    requestContext.bind(CoreBindings.Http.CONTEXT).to(requestContext);
    return requestContext;
  }
}
