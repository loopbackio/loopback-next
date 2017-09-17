// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export namespace CoreBindings {
  // application
  export const APPLICATION_INSTANCE = 'application.instance';
  export const APPLICATION_CONFIG = 'application.config';

  // server
  export const SERVERS = 'servers';

  // controller
  export const CONTROLLER_CLASS = 'controller.current.ctor';
  export const CONTROLLER_METHOD_NAME = 'controller.current.operation';
  export const CONTROLLER_METHOD_META = 'controller.method.meta';
}
