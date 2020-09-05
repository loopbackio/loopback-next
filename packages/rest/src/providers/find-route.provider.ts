// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, BindingScope, Context, inject, Provider} from '@loopback/core';
import {asMiddleware, Middleware} from '@loopback/express';
import debugFactory from 'debug';
import {HttpHandler} from '../http-handler';
import {RestBindings, RestTags} from '../keys';
import {ResolvedRoute} from '../router';
import {RestMiddlewareGroups} from '../sequence';
import {FindRoute, Request} from '../types';

const debug = debugFactory('loopback:rest:find-route');

export class FindRouteProvider implements Provider<FindRoute> {
  constructor(
    @inject(RestBindings.Http.CONTEXT) protected context: Context,
    @inject(RestBindings.HANDLER) protected handler: HttpHandler,
  ) {}

  value(): FindRoute {
    return request => this.action(request);
  }

  action(request: Request): ResolvedRoute {
    const found = this.handler.findRoute(request);
    debug('Route found for %s %s', request.method, request.originalUrl, found);
    found.updateBindings(this.context);
    return found;
  }
}

@bind(
  asMiddleware({
    group: RestMiddlewareGroups.FIND_ROUTE,
    chain: RestTags.REST_MIDDLEWARE_CHAIN,
  }),
  {scope: BindingScope.SINGLETON},
)
export class FindRouteMiddlewareProvider implements Provider<Middleware> {
  value(): Middleware {
    return async (ctx, next) => {
      const request = ctx.request;
      debug('Finding route for %s %s', request.method, request.originalUrl);
      const handler = await ctx.get(RestBindings.HANDLER);
      const route = handler.findRoute(request);
      debug(
        'Route found for %s %s',
        request.method,
        request.originalUrl,
        route,
      );
      route.updateBindings(ctx);
      ctx.bind(RestBindings.Operation.ROUTE).to(route);
      return next();
    };
  }
}
