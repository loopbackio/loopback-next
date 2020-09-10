// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingScope,
  Context,
  inject,
  injectable,
  Provider,
} from '@loopback/core';
import {asMiddleware, Middleware} from '@loopback/express';
import debugFactory from 'debug';
import {RestBindings, RestTags} from '../keys';
import {RouteEntry} from '../router';
import {RestMiddlewareGroups} from '../sequence';
import {InvokeMethod, OperationArgs, OperationRetval} from '../types';

const debug = debugFactory('loopback:rest:invoke-method');

export class InvokeMethodProvider implements Provider<InvokeMethod> {
  constructor(@inject(RestBindings.Http.CONTEXT) protected context: Context) {}

  value(): InvokeMethod {
    return (route, args) => this.action(route, args);
  }

  action(route: RouteEntry, args: OperationArgs): Promise<OperationRetval> {
    return route.invokeHandler(this.context, args);
  }
}

@injectable(
  asMiddleware({
    group: RestMiddlewareGroups.INVOKE_METHOD,
    upstreamGroups: RestMiddlewareGroups.PARSE_PARAMS,
    chain: RestTags.REST_MIDDLEWARE_CHAIN,
  }),
  {scope: BindingScope.SINGLETON},
)
export class InvokeMethodMiddlewareProvider implements Provider<Middleware> {
  value(): Middleware {
    return async (ctx, next) => {
      const route: RouteEntry = await ctx.get(RestBindings.Operation.ROUTE);
      const params: OperationArgs = await ctx.get(
        RestBindings.Operation.PARAMS,
      );
      if (debug.enabled) {
        debug('Invoking method %s with', route.describe(), params);
      }
      try {
        const retVal = await route.invokeHandler(ctx, params);
        ctx.bind(RestBindings.Operation.RETURN_VALUE).to(retVal);
        if (debug.enabled) {
          debug('Return value from %s', route.describe(), retVal);
        }
        return retVal;
      } catch (err) {
        if (debug.enabled) {
          debug('Error thrown from %s', route.describe(), err);
        }
        throw err;
      }
    };
  }
}
