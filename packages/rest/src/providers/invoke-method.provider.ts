// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, Context, inject, Provider} from '@loopback/core';
import {asMiddleware, Middleware} from '@loopback/express';
import {RestBindings, RestTags} from '../keys';
import {RouteEntry} from '../router';
import {RestMiddlewareGroups} from '../sequence';
import {InvokeMethod, OperationArgs, OperationRetval} from '../types';

export class InvokeMethodProvider implements Provider<InvokeMethod> {
  constructor(@inject(RestBindings.Http.CONTEXT) protected context: Context) {}

  value(): InvokeMethod {
    return (route, args) => this.action(route, args);
  }

  action(route: RouteEntry, args: OperationArgs): Promise<OperationRetval> {
    return route.invokeHandler(this.context, args);
  }
}

@bind(
  asMiddleware({
    group: RestMiddlewareGroups.INVOKE_METHOD,
    upstreamGroups: RestMiddlewareGroups.PARSE_PARAMS,
    chain: RestTags.REST_MIDDLEWARE_CHAIN,
  }),
)
export class InvokeMethodMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @inject(RestBindings.SequenceActions.INVOKE_METHOD)
    protected invokeMethod: InvokeMethod,
  ) {}

  value(): Middleware {
    return async (ctx, next) => {
      const route: RouteEntry = await ctx.get(RestBindings.Operation.ROUTE);
      const params: OperationArgs = await ctx.get(
        RestBindings.Operation.PARAMS,
      );
      const retVal = await this.invokeMethod(route, params);
      ctx.bind(RestBindings.Operation.RETURN_VALUE).to(retVal);
      return retVal;
    };
  }
}
