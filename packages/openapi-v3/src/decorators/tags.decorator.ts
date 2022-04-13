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
import {TagsDecoratorMetadata} from '../types';

/**
 * Add tags for an endpoint. When applied to a class, this decorator
 * adds the tags to all endpoints.
 *
 * @param tagNames - A list of tags for API documentation control. Tags can be
 *        used for logical grouping of operations by resources or any other
 *        qualifier.
 *
 * @example
 * ```ts
 * @oas.tags('greeting', 'public')
 * class MyController {
 *   @get('/greet')
 *   greet() {
 *     return 'Hello world!';
 *   }

 *   @get('/echo')
 *   echo() {
 *     return 'Hello world!';
 *   }
 * }
 * ```
 *
 * or
 *
 * ```ts
 * class MyController {
 *   @oas.tags('greeting', 'public')
 *   @get('/greet')
 *   greet() {
 *     return 'Hello world!';
 *   }

 *   @get('/echo')
 *   echo() {
 *     return 'Hello world!';
 *   }
 * }
 * ```
 */
export function tags(...tagNames: string[]) {
  return function tagsDecoratorForClassOrMethod(
    // Class or a prototype
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
    method?: string,
    // Use `any` to for `TypedPropertyDescriptor`
    // See https://github.com/loopbackio/loopback-next/pull/2704
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    methodDescriptor?: TypedPropertyDescriptor<any>,
  ) {
    if (method && methodDescriptor) {
      // Method
      return MethodDecoratorFactory.createDecorator<TagsDecoratorMetadata>(
        OAI3Keys.TAGS_METHOD_KEY,
        {tags: tagNames},
        {decoratorName: '@oas.tags'},
      )(target, method, methodDescriptor);
    } else if (typeof target === 'function' && !method && !methodDescriptor) {
      // Class
      return ClassDecoratorFactory.createDecorator<TagsDecoratorMetadata>(
        OAI3Keys.TAGS_CLASS_KEY,
        {tags: tagNames},
        {decoratorName: '@oas.tags'},
      )(target);
    } else {
      throw new Error(
        '@oas.tags cannot be used on a property: ' +
          DecoratorFactory.getTargetName(target, method, methodDescriptor),
      );
    }
  };
}
