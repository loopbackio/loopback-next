// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/router
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Interface for router implementation
 */
export interface Router<T, R, K> {
  /**
   * Add a route to the router
   * @param route - A route entry
   */
  add(route: T): void;

  /**
   * Find a matching route for the given http request
   * @param request - Http request
   * @returns The resolved route, if not found, `undefined` is returned
   */
  find(request: K): R | undefined;

  /**
   * List all routes
   */
  list(): T[];
}
