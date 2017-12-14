// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/authenticate
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  MetadataInspector,
  Constructor,
  MethodDecoratorFactory,
} from '@loopback/context';
import {AuthenticationBindings} from '../keys';

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
  return MethodDecoratorFactory.createDecorator<AuthenticationMetadata>(
    AuthenticationBindings.METADATA,
    {
      strategy: strategyName,
      options: options || {},
    },
  );
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
  return MetadataInspector.getMethodMetadata<AuthenticationMetadata>(
    AuthenticationBindings.METADATA,
    controllerClass.prototype,
    methodName,
  );
}
