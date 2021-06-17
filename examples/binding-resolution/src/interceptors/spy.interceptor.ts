// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/example-binding-resolution
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  Context,
  globalInterceptor,
  inject,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import {bindingScope, count, logContext, logContexts} from '../util';

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@globalInterceptor(
  'spy',
  {tags: {name: 'Spy'}},
  {scope: bindingScope('SpyInterceptor')},
)
export class SpyInterceptorProvider implements Provider<Interceptor> {
  // Inject the resolution context and current binding for logging purpose
  constructor(
    @inject.context()
    resolutionCtx: Context,
    @inject.binding()
    private binding: Binding<unknown>,
  ) {
    logContexts(resolutionCtx, binding);
  }

  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The logic to intercept an invocation
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    try {
      logContext('Invocation', invocationCtx, this.binding);
      await count(invocationCtx, 'SpyInterceptor');
      // Add pre-invocation logic here
      const result = await next();
      // Add post-invocation logic here
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
