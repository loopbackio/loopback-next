// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/context';
import {PathObject, SchemasObject} from '@loopback/openapi-v3-types';
import {ControllerSpec} from '@loopback/openapi-v3';

import {SequenceHandler} from './sequence';
import {
  RoutingTable,
  ResolvedRoute,
  RouteEntry,
  ControllerClass,
  ControllerFactory,
} from './router/routing-table';
import {Request, Response} from './types';

import {RestBindings} from './keys';
import {RequestContext} from './request-context';

export class HttpHandler {
  protected _routes: RoutingTable = new RoutingTable();
  protected _apiDefinitions: SchemasObject;

  public handleRequest: (request: Request, response: Response) => Promise<void>;

  constructor(protected _rootContext: Context) {
    this.handleRequest = (req, res) => this._handleRequest(req, res);
  }

  registerController<T>(
    spec: ControllerSpec,
    controllerCtor: ControllerClass<T>,
    controllerFactory?: ControllerFactory<T>,
  ) {
    this._routes.registerController(spec, controllerCtor, controllerFactory);
  }

  registerRoute(route: RouteEntry) {
    this._routes.registerRoute(route);
  }

  registerApiDefinitions(defs: SchemasObject) {
    this._apiDefinitions = Object.assign({}, this._apiDefinitions, defs);
  }

  getApiDefinitions() {
    return this._apiDefinitions;
  }

  describeApiPaths(): PathObject {
    return this._routes.describeApiPaths();
  }

  findRoute(request: Request): ResolvedRoute {
    const route = this._routes.find(request);
    Object.assign(route.schemas, this.getApiDefinitions());
    return route;
  }

  protected async _handleRequest(
    request: Request,
    response: Response,
  ): Promise<void> {
    const requestContext = new RequestContext(
      request,
      response,
      this._rootContext,
    );

    const sequence = await requestContext.get<SequenceHandler>(
      RestBindings.SEQUENCE,
    );
    await sequence.handle(requestContext);
  }
}
