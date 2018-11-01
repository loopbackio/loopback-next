// Copyright IBM Corp. 2018, 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Request} from '../types';
import {ResolvedRoute, RouteEntry} from './route-entry';

/*
/**
 * Interface for router implementation
 */
export interface RestRouter {
  /**
   * Add a route to the router
   * @param route A route entry
   */
  add(route: RouteEntry): void;

  /**
   * Find a matching route for the given http request
   * @param request Http request
   * @returns The resolved route, if not found, `undefined` is returned
   */
  find(request: Request): ResolvedRoute | undefined;

  /**
   * List all routes
   */
  list(): RouteEntry[];
}
