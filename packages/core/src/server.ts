// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Defines the requirements to implement a Server for LoopBack applications:
 * start() : Promise<void>
 * stop() : Promise<void>
 * It is recommended that each Server implementation creates its own child
 * Context, which inherits from the parent Application context. This way,
 * any Server-specific bindings will remain local to the Server instance,
 * and will avoid polluting its parent module scope.
 *
 * @export
 * @interface Server
 */
export interface Server {
  /**
   * Tells whether the server is listening for connections or not
   */
  readonly listening: boolean;

  /**
   * Start the server
   */
  start(): Promise<void>;
  /**
   * Stop the server
   */
  stop(): Promise<void>;
}
