// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {InvocationArgs, invokeMethod, Next} from '@loopback/context';
import {HttpContext, RestAction} from '../types';

export class BaseRestAction implements RestAction {
  async intercept(ctx: HttpContext, next: Next) {
    return await next();
  }

  /**
   * Delegate the call to an instance method
   * @param ctx - Http context
   * @param methodName - Method to handle the processing with dependency
   * injection
   * @param nonInjectedArgs Non-injected arguments
   */
  protected async delegate(
    ctx: HttpContext,
    methodName: string,
    nonInjectedArgs?: InvocationArgs,
  ) {
    return await invokeMethod(this, methodName, ctx, nonInjectedArgs, {
      skipInterceptors: true,
    });
  }
}
