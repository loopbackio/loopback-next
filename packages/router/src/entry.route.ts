// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/router
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/core';

/**
 * An entry in the routing table
 */
export interface RouteEntry<P, A, R> {
  /**
   * Path
   */
  readonly path: P;

  /**
   * Update bindings for the request context
   * @param requestContext
   */
  updateBindings(requestContext: Context): void;

  /**
   * A handler to invoke the resolved controller method
   * @param requestContext
   * @param args
   */
  invokeHandler(requestContext: Context, args: A): Promise<R>;

  describe(): string;
}
