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
import {OpenApiSpec} from '@loopback/openapi-spec';
import {ServerRequest, ServerResponse} from 'http';
import {getApiSpec} from './router/metadata';

import {SequenceHandler} from './sequence';
import {
  RoutingTable,
  parseRequestUrl,
  ResolvedRoute,
  RouteEntry,
} from './router/routing-table';
import {
  FindRoute,
  InvokeMethod,
  ParsedRequest,
  OperationArgs,
} from './internal-types';

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

  registerController<T>(name: Constructor<T>, spec: OpenApiSpec) {
    this._routes.registerController(name, spec);
  }

  registerRoute(route: RouteEntry) {
    this._routes.registerRoute(route);
  }

  protected async _handleRequest(
    request: ServerRequest,
    response: ServerResponse,
  ): Promise<void> {
    const parsedRequest: ParsedRequest = parseRequestUrl(request);
    const requestContext = this._createRequestContext(request, response);

    this._bindFindRoute(requestContext);
    this._bindInvokeMethod(requestContext);
    this._bindGetFromContext(requestContext);
    this._bindBindElement(requestContext);

    const sequence: SequenceHandler = await requestContext.get('sequence');
    await sequence.handle(parsedRequest, response);
  }

  protected _createRequestContext(
    req: ServerRequest,
    res: ServerResponse,
  ): Context {
    const requestContext = new Context(this._rootContext);
    requestContext.bind('http.request').to(req);
    requestContext.bind('http.response').to(res);
    return requestContext;
  }

  protected _bindGetFromContext(context: Context): void {
    context.bind('getFromContext').to(
      (key: string): Promise<BoundValue> => context.get(key));
  }

  protected _bindBindElement(context: Context): void {
    context.bind('bindElement').to((key: string): Binding => context.bind(key));
  }

  protected _bindFindRoute(context: Context): void {
    const findRoute: FindRoute = (request) => {
      const found = this._routes.find(request);
      found.updateBindings(context);
      return found;
    };
    context.bind('findRoute').to(findRoute);
  }

  protected _bindInvokeMethod(context: Context) {
    const invoke: InvokeMethod = async (route, args) => {
      return await route.invokeHandler(context, args);
    };
    context.bind('invokeMethod').to(invoke);
  }
}
