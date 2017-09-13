// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// tslint:disable:no-any

// TODO(bajtos) serviceSpec needs to be typed
export function service(serviceSpec: any) {
  return function(controllerCtor: Function) {
    (controllerCtor as any).grpcService = serviceSpec;
  };
}
