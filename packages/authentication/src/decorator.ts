// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/authenticate
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Reflector, Constructor} from '@loopback/context';
import {BindingKeys} from './keys';

/**
 * Authentication metadata stored via Reflection API
 */
export interface AuthenticationMetadata {
  strategy: string;
  options?: Object;
}

/**
 * Mark a controller method as requiring authenticated user.
 *
 * @param strategyName The name of the authentication strategy to use.
 * @param options Additional options to configure the authentication.
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
 * Fetch authentication metadata stored by `@authenticate` decorator.
 *
 * @param controllerClass Target controller
 * @param methodName Target method
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
