// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/authenticate
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Reflector, Constructor} from '@loopback/context';
import {BindingKeys} from './keys';

/* class to hold authentication metadata
 */
export interface AuthenticationMetadata {
  strategy: string;
  options?: Object;
}

/**
 * decorator to add authentication metadata to controller methods
 * @param strategyName
 * @param options
 */
export function authenticate(strategyName: string, options?: Object) {
  return function(controllerClass: Object, methodName: string) {
    const metadataObj: AuthenticationMetadata = {
      strategy: strategyName,
      options: options || {},
    };
    Reflector.defineMetadata(
      BindingKeys.Authentication.METADATA,
      metadataObj,
      controllerClass,
      methodName,
    );
  };
}

/**
 * function to get stored authentication metadata in a controller method
 * @param controllerObj
 * @param methodName
 */
export function getAuthenticateMetadata(
  controllerClass: Constructor<{}>,
  methodName: string,
): AuthenticationMetadata | undefined {
  return Reflector.getMetadata(
    BindingKeys.Authentication.METADATA,
    controllerClass.prototype,
    methodName,
  );
}
