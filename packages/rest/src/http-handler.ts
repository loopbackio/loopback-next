// Copyright IBM Corp. and LoopBack contributors 2017,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/core';
import {
  ComponentsObject,
  ControllerSpec,
  PathObject,
  ReferenceObject,
  SchemaObject,
  SchemasObject,
} from '@loopback/openapi-v3';
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
  /**
   * Shared OpenAPI spec objects as `components`
   */
  protected _openApiComponents: ComponentsObject;

  public handleRequest: (request: Request, response: Response) => Promise<void>;

  constructor(
    protected readonly _rootContext: Context,
    protected readonly _serverConfig: RestServerResolvedConfig,
    protected readonly _routes = new RoutingTable(),
  ) {
    this.handleRequest = (req, res) => this._handleRequest(req, res);
  }

  registerController<T extends object>(
    spec: ControllerSpec,
    controllerCtor: ControllerClass<T>,
    controllerFactory?: ControllerFactory<T>,
  ) {
    this._routes.registerController(spec, controllerCtor, controllerFactory);
  }

  registerRoute(route: RouteEntry) {
    this._routes.registerRoute(route);
  }

  /**
   * @deprecated Use `registerApiComponents`
   * @param defs Schemas
   */
  registerApiDefinitions(defs: SchemasObject) {
    this.registerApiComponents({schemas: defs});
  }

  /**
   * Merge components into the OpenApi spec
   * @param defs - Components
   */
  registerApiComponents(defs: ComponentsObject) {
    this._openApiComponents = this._openApiComponents ?? {};
    for (const p in defs) {
      // Merge each child, such as `schemas`, `parameters`, and `headers`
      this._openApiComponents[p] = {...this._openApiComponents[p], ...defs[p]};
    }
  }

  getApiComponents() {
    return this._openApiComponents;
  }

  /**
   * @deprecated Use `getApiComponents`
   */
  getApiDefinitions():
    | {
        [schema: string]: SchemaObject | ReferenceObject;
      }
    | undefined {
    return this._openApiComponents?.schemas;
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
