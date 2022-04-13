// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ClassDecoratorFactory,
  DecoratorFactory,
  MethodDecoratorFactory,
} from '@loopback/core';
import {OAI3Keys} from '../keys';

const debug = require('debug')(
  'loopback:openapi3:metadata:controller-spec:deprecated',
);

/**
 * Marks an api path as deprecated.  When applied to a class, this decorator
 * marks all paths as deprecated.
 *
 * You can optionally mark all controllers in a class as deprecated, but use
 * `@deprecated(false)` on a specific method to ensure it is not marked
 * as deprecated in the specification.
 *
 * @param isDeprecated - whether or not the path should be marked as deprecated.
 *        This is useful for marking a class as deprecated, but a method as
 *        not deprecated.
 *
 * @example
 * ```ts
 * @oas.deprecated()
 * class MyController {
 *   @get('/greet')
 *   public async function greet() {
 *     return 'Hello, World!'
 *   }
 *
 *   @get('/greet-v2')
 *   @oas.deprecated(false)
 *   public async function greetV2() {
 *     return 'Hello, World!'
 *   }
 * }
 *
 * class MyOtherController {
 *   @get('/echo')
 *   public async function echo() {
 *     return 'Echo!'
 *   }
 * }
 * ```
 */
export function deprecated(isDeprecated = true) {
  return function deprecatedDecoratorForClassOrMethod(
    // Class or a prototype
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
    method?: string,
    // Use `any` to for `TypedPropertyDescriptor`
    // See https://github.com/loopbackio/loopback-next/pull/2704
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    methodDescriptor?: TypedPropertyDescriptor<any>,
  ) {
    debug(target, method, methodDescriptor);

    if (method && methodDescriptor) {
      // Method
      return MethodDecoratorFactory.createDecorator<boolean>(
        OAI3Keys.DEPRECATED_METHOD_KEY,
        isDeprecated,
        {decoratorName: '@oas.deprecated'},
      )(target, method, methodDescriptor);
    } else if (typeof target === 'function' && !method && !methodDescriptor) {
      // Class
      return ClassDecoratorFactory.createDecorator<boolean>(
        OAI3Keys.DEPRECATED_CLASS_KEY,
        isDeprecated,
        {decoratorName: '@oas.deprecated'},
      )(target);
    } else {
      throw new Error(
        '@oas.deprecated cannot be used on a property: ' +
          DecoratorFactory.getTargetName(target, method, methodDescriptor),
      );
    }
  };
}
