// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/logging
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {intercept} from '@loopback/core';
import {LoggingBindings} from '../keys';

/**
 * `@logInvocation` decorator for method invocations.
 *
 * @example
 * ```ts
 * import {logInvocation} from '@loopback/logging';
 *
 * export class HelloController {
 *   @logInvocation()
 *   hello(name: string) {
 *     return `Hello, ${name}`;
 *   }
 * }
 * ```
 */
export function logInvocation() {
  // A shortcut to `@intercept` that invokes the winston interceptor that logs
  // method invocations
  return intercept(LoggingBindings.WINSTON_INVOCATION_LOGGER);
}
