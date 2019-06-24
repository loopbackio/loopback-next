// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/context';
import {ControllerSpec, PathObject, SchemasObject} from '@loopback/openapi-v3';
import {RestBindings} from './keys';
import {RequestContext} from './request-context';
import {RestServerResolvedConfig} from './rest.server';
import {
  ControllerClass,
  ControllerFactory,
  ResolvedRoute,
  RouteEntry,
  RoutingTable,
} from './router';
import {SequenceHandler} from './sequence';
import {Request, Response} from './types';

export class HttpHandler {
  protected _apiDefinitions: SchemasObject;

  public handleRequest: (request: Request, response: Response) => Promise<void>;

  constructor(
    protected readonly _rootContext: Context,
    protected readonly _serverConfig: RestServerResolvedConfig,
    protected readonly _routes = new RoutingTable(),
  ) {
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
      this._serverConfig,
    );

    const sequence = await requestContext.get<SequenceHandler>(
      RestBindings.SEQUENCE,
    );
    await sequence.handle(requestContext);
  }
}
