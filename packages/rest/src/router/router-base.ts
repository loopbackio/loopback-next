// Copyright IBM Corp. and LoopBack contributors 2018,2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Request} from '../types';
import {getPathVariables} from './openapi-path';
import {RestRouter, RestRouterOptions} from './rest-router';
import {createResolvedRoute, ResolvedRoute, RouteEntry} from './route-entry';
import {compareRoute} from './route-sort';

/**
 * Base router implementation that only handles path without variables
 */
export abstract class BaseRouter implements RestRouter {
  /**
   * A map to optimize matching for routes without variables in the path
   */
  protected routesWithoutPathVars: {[key: string]: RouteEntry} = {};

  constructor(protected options: RestRouterOptions = {strict: false}) {}

  protected getKeyForRoute(route: RouteEntry) {
    return this.getKey(route.verb, route.path);
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
    return this.getKey(request.method, request.path);
  }

  find(request: Request) {
    if (this.options.strict) {
      return this.findRoute(request.method, request.path);
    }
    // Non-strict mode
    let path = request.path;
    // First try the exact match
    const route = this.findRoute(request.method, path);
    if (route || path === '/') return route;
    if (path.endsWith('/')) {
      // Fall back to the path without trailing slash
      path = path.substring(0, path.length - 1);
    } else {
      // Fall back to the path with trailing slash
      path = path + '/';
    }
    return this.findRoute(request.method, path);
  }

  private findRoute(verb: string, path: string) {
    const key = this.getKey(verb, path);
    const route = this.routesWithoutPathVars[key];
    if (route) return createResolvedRoute(route, {});
    else return this.findRouteWithPathVars(verb, path);
  }

  list() {
    let routes = Object.values(this.routesWithoutPathVars);
    routes = routes.concat(this.listRoutesWithPathVars());
    // Sort the routes so that they show up in OpenAPI spec in order
    return routes.sort(compareRoute);
  }

  /**
   * Build a key for verb+path as `/<verb>/<path>`
   * @param verb - HTTP verb/method
   * @param path - URL path
   */
  protected getKey(verb: string, path: string) {
    verb = normalizeVerb(verb);
    path = normalizePath(path);
    return `/${verb}${path}`;
  }

  // The following abstract methods need to be implemented by its subclasses
  /**
   * Add a route with path variables
   * @param route - Route
   */
  protected abstract addRouteWithPathVars(route: RouteEntry): void;

  /**
   * Find a route with path variables for a given request
   * @param request - Http request
   */
  protected abstract findRouteWithPathVars(
    verb: string,
    path: string,
  ): ResolvedRoute | undefined;

  /**
   * List routes with path variables
   */
  protected abstract listRoutesWithPathVars(): RouteEntry[];
}

/**
 * Normalize http verb to lowercase
 * @param verb - Http verb
 */
function normalizeVerb(verb: string) {
  // Use lower case, default to `get`
  return verb?.toLowerCase() || 'get';
}

/**
 * Normalize path to make sure it starts with `/`
 * @param path - Path
 */
function normalizePath(path: string) {
  // Prepend `/` if needed
  path = path || '/';
  path = path.startsWith('/') ? path : `/${path}`;
  return path;
}
