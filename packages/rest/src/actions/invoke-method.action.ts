// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, Getter, inject, Next} from '@loopback/context';
import {RestBindings} from '../keys';
import {RouteEntry} from '../router';
import {
  HttpContext,
  InvokeMethod,
  OperationArgs,
  RestAction,
  restAction,
} from '../types';

@restAction('invoke')
export class InvokeMethodAction implements RestAction {
  constructor(
    @inject.context()
    private context: Context,
    @inject.getter(RestBindings.RESOLVED_ROUTE)
    protected getRoute: Getter<RouteEntry>,
    @inject.getter(RestBindings.OPERATION_ARGS)
    protected getArgs: Getter<OperationArgs>,
  ) {}

  async action(ctx: HttpContext, next: Next) {
    const result = await this.invokeMethod(
      await this.getRoute(),
      await this.getArgs(),
    );
    ctx.bind(RestBindings.OPERATION_RESULT).to(result);
    return result;
  }

  async invokeMethod(route: RouteEntry, args: OperationArgs) {
    return await route.invokeHandler(this.context, args);
  }

  get handler(): InvokeMethod {
    return this.invokeMethod.bind(this);
  }
}
