// Copyright IBM Corp. 2017, 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Request} from '../types';
import {getPathVariables} from './openapi-path';
import {createResolvedRoute, ResolvedRoute, RouteEntry} from './route-entry';
import {compareRoute} from './route-sort';
import {RestRouter} from './rest-router';

/**
 * Base router implementation that only handles path without variables
 */
export abstract class BaseRouter implements RestRouter {
  /**
   * A map to optimize matching for routes without variables in the path
   */
  protected routesWithoutPathVars: {[path: string]: RouteEntry} = {};

  protected getKeyForRoute(route: RouteEntry) {
    const path = route.path.startsWith('/') ? route.path : `/${route.path}`;
    const verb = route.verb.toLowerCase() || 'get';
    return `/${verb}${path}`;
  }

  add(route: RouteEntry) {
    if (!getPathVariables(route.path)) {
      const key = this.getKeyForRoute(route);
      this.routesWithoutPathVars[key] = route;
    } else {
      this.addRouteWithPathVars(route);
    }
  }

  protected getKeyForRequest(request: Request) {
    const method = request.method.toLowerCase();
    return `/${method}${request.path}`;
  }

  find(request: Request) {
    const path = this.getKeyForRequest(request);
    let route = this.routesWithoutPathVars[path];
    if (route) return createResolvedRoute(route, {});
    else return this.findRouteWithPathVars(request);
  }

  list() {
    let routes = Object.values(this.routesWithoutPathVars);
    routes = routes.concat(this.listRoutesWithPathVars());
    // Sort the routes so that they show up in OpenAPI spec in order
    return routes.sort(compareRoute);
  }

  // The following abstract methods need to be implemented by its subclasses
  /**
   * Add a route with path variables
   * @param route
   */
  protected abstract addRouteWithPathVars(route: RouteEntry): void;

  /**
   * Find a route with path variables
   * @param route
   */
  protected abstract findRouteWithPathVars(
    request: Request,
  ): ResolvedRoute | undefined;

  /**
   * List routes with path variables
   */
  protected abstract listRoutesWithPathVars(): RouteEntry[];
}
