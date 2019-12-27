// Copyright IBM Corp. 2018. All Rights Reserved.
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

export function deprecated(isDeprecated = true) {
  return function deprecatedDecoratorForClassOrMethod(
    // Class or a prototype
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
    method?: string,
    // Use `any` to for `TypedPropertyDescriptor`
    // See https://github.com/strongloop/loopback-next/pull/2704
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    methodDescriptor?: TypedPropertyDescriptor<any>,
  ) {
    debug(target, method, methodDescriptor);

    if (method && methodDescriptor) {
      // Method
      return MethodDecoratorFactory.createDecorator<boolean>(
        OAI3Keys.DEPRECATED_METHOD_KEY,
        isDeprecated,
        {decoratorName: '@deprecated'},
      )(target, method, methodDescriptor);
    } else if (typeof target === 'function' && !method && !methodDescriptor) {
      // Class
      return ClassDecoratorFactory.createDecorator<boolean>(
        OAI3Keys.DEPRECATED_CLASS_KEY,
        isDeprecated,
        {decoratorName: '@deprecated'},
      )(target);
    } else {
      throw new Error(
        '@deprecated cannot be used on a property: ' +
          DecoratorFactory.getTargetName(target, method, methodDescriptor),
      );
    }
  };
}
