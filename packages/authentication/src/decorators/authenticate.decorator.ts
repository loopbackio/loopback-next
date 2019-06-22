// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  MetadataInspector,
  Constructor,
  MethodDecoratorFactory,
} from '@loopback/context';
import {AUTHENTICATION_METADATA_KEY} from '../keys';

/**
 * Authentication metadata stored via Reflection API
 */
export interface AuthenticationMetadata {
  strategy: string;
  options?: object;
}

/**
 * Mark a controller method as requiring authenticated user.
 *
 * @param strategyName - The name of the authentication strategy to use.
 * @param options - Additional options to configure the authentication.
 */
export function authenticate(strategyName: string, options?: object) {
  return MethodDecoratorFactory.createDecorator<AuthenticationMetadata>(
    AUTHENTICATION_METADATA_KEY,
    {
      strategy: strategyName,
      options: options || {},
    },
  );
}

/**
 * Fetch authentication metadata stored by `@authenticate` decorator.
 *
 * @param controllerClass - Target controller
 * @param methodName - Target method
 */
export function getAuthenticateMetadata(
  controllerClass: Constructor<{}>,
  methodName: string,
): AuthenticationMetadata | undefined {
  return MetadataInspector.getMethodMetadata<AuthenticationMetadata>(
    AUTHENTICATION_METADATA_KEY,
    controllerClass.prototype,
    methodName,
  );
}
