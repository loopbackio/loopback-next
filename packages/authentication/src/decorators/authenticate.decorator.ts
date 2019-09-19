// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ClassDecoratorFactory,
  Constructor,
  DecoratorFactory,
  MetadataInspector,
  MethodDecoratorFactory,
} from '@loopback/context';
import {
  AUTHENTICATION_METADATA_CLASS_KEY,
  AUTHENTICATION_METADATA_KEY,
  AUTHENTICATION_METADATA_METHOD_KEY,
} from '../keys';

/**
 * Authentication metadata stored via Reflection API
 */
export interface AuthenticationMetadata {
  strategy: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: {[name: string]: any};
}

class AuthenticateClassDecoratorFactory extends ClassDecoratorFactory<
  AuthenticationMetadata
> {}

/**
 * Mark a controller method as requiring authenticated user.
 *
 * @param strategyName - The name of the authentication strategy to use.
 * @param options - Additional options to configure the authentication.
 */
export function authenticate(strategyName: string, options?: object) {
  return function authenticateDecoratorForClassOrMethod(
    // Class or a prototype
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
    method?: string,
    // Use `any` to for `TypedPropertyDescriptor`
    // See https://github.com/strongloop/loopback-next/pull/2704
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    methodDescriptor?: TypedPropertyDescriptor<any>,
  ) {
    if (method && methodDescriptor) {
      // Method
      return MethodDecoratorFactory.createDecorator<AuthenticationMetadata>(
        AUTHENTICATION_METADATA_KEY,
        {
          strategy: strategyName,
          options: options || {},
        },
        {decoratorName: '@authenticate'},
      )(target, method, methodDescriptor);
    }
    if (typeof target === 'function' && !method && !methodDescriptor) {
      // Class
      return AuthenticateClassDecoratorFactory.createDecorator(
        AUTHENTICATION_METADATA_CLASS_KEY,
        {
          strategy: strategyName,
          options: options || {},
        },
        {decoratorName: '@authenticate'},
      )(target);
    }
    // Not on a class or method
    throw new Error(
      '@intercept cannot be used on a property: ' +
        DecoratorFactory.getTargetName(target, method, methodDescriptor),
    );
  };
}

export namespace authenticate {
  /**
   * `@authenticate.skip()` - a sugar decorator to skip authentication
   */
  export const skip = () => authenticate('', {skip: true});
}

/**
 * Fetch authentication metadata stored by `@authenticate` decorator.
 *
 * @param targetClass - Target controller
 * @param methodName - Target method
 */
export function getAuthenticateMetadata(
  targetClass: Constructor<{}>,
  methodName: string,
): AuthenticationMetadata | undefined {
  // First check method level
  let metadata = MetadataInspector.getMethodMetadata<AuthenticationMetadata>(
    AUTHENTICATION_METADATA_METHOD_KEY,
    targetClass.prototype,
    methodName,
  );
  if (metadata && metadata.options && metadata.options.skip) return undefined;
  if (metadata) return metadata;
  // Check if the class level has `@authenticate`
  metadata = MetadataInspector.getClassMetadata<AuthenticationMetadata>(
    AUTHENTICATION_METADATA_CLASS_KEY,
    targetClass,
  );
  if (metadata && metadata.options && metadata.options.skip) return undefined;
  return metadata;
}
