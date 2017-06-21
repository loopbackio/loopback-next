// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export namespace BindingKeys {
  export namespace Context {
    export const CONTROLLER_CLASS: string = 'controller.current.ctor';
    export const CONTROLLER_METHOD_NAME: string
      = 'controller.current.operation';
    export const CONTROLLER_METHOD_META: string = 'controller.method.meta';
    export const AUTHENTICATION_PROVIDER = 'authentication.provider';
  }
}
