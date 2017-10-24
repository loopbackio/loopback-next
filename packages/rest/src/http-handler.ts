// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/context';
import {PathsObject} from '@loopback/openapi-spec';
import {ServerRequest, ServerResponse} from 'http';
import {ControllerSpec} from './router/metadata';

import {SequenceHandler} from './sequence';
import {
  RoutingTable,
  parseRequestUrl,
  ResolvedRoute,
  RouteEntry,
  ControllerClass,
} from './router/routing-table';
import {ParsedRequest} from './internal-types';

import {RestBindings} from './keys';

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

  findRoute(request: ParsedRequest): ResolvedRoute {
    return this._routes.find(request);
  }

  protected async _handleRequest(
    request: ServerRequest,
    response: ServerResponse,
  ): Promise<void> {
    const parsedRequest: ParsedRequest = parseRequestUrl(request);
    const requestContext = this._createRequestContext(request, response);

    const sequence: SequenceHandler = await requestContext.get(
      RestBindings.SEQUENCE,
    );
    await sequence.handle(parsedRequest, response);
  }

  protected _createRequestContext(
    req: ServerRequest,
    res: ServerResponse,
  ): Context {
    const requestContext = new Context(this._rootContext);
    requestContext.bind(RestBindings.Http.REQUEST).to(req);
    requestContext.bind(RestBindings.Http.RESPONSE).to(res);
    requestContext.bind(RestBindings.Http.CONTEXT).to(requestContext);
    return requestContext;
  }
}
