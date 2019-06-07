// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject} from '@loopback/context';
import {RestBindings} from '../keys';
import {RouteEntry} from '../router';
import {HttpContext, InvokeMethod, OperationArgs, restAction} from '../types';
import {BaseRestAction} from './base-action';

@restAction('invoke')
export class InvokeMethodAction extends BaseRestAction {
  constructor(
    @inject(RestBindings.Http.CONTEXT)
    private context: Context,
  ) {
    super();
  }

  async intercept(ctx: HttpContext) {
    const result = await this.delegate(ctx, 'invokeMethod');
    ctx.bind(RestBindings.OPERATION_RESULT).to(result);
    return result;
  }

  async invokeMethod(
    @inject(RestBindings.RESOLVED_ROUTE) route: RouteEntry,
    @inject(RestBindings.OPERATION_ARGS) args: OperationArgs,
  ) {
    return await route.invokeHandler(this.context, args);
  }

  get handler(): InvokeMethod {
    return this.invokeMethod.bind(this);
  }
}
