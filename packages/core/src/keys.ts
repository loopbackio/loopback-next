// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Namespace for core binding keys
 */
export namespace CoreBindings {
  // application
  /**
   * Binding key for application instance itself
   */
  export const APPLICATION_INSTANCE = 'application.instance';
  /**
   * Binding key for application configuration
   */
  export const APPLICATION_CONFIG = 'application.config';

  // server
  /**
   * Binding key for servers
   */
  export const SERVERS = 'servers';

  // controller
  /**
   * Binding key for the controller class resolved in the current request
   * context
   */
  export const CONTROLLER_CLASS = 'controller.current.ctor';
  /**
   * Binding key for the controller method resolved in the current request
   * context
   */
  export const CONTROLLER_METHOD_NAME = 'controller.current.operation';
  /**
   * Binding key for the controller method metadata resolved in the current
   * request context
   */
  export const CONTROLLER_METHOD_META = 'controller.method.meta';
}
