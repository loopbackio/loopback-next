// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
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
import {HttpHandler} from '../http-handler';
import {RestBindings, RestTags} from '../keys';
import {RestMiddlewareGroups} from '../sequence';
import {FindRoute} from '../types';

const debug = debugFactory('loopback:rest:find-route');

export class FindRouteProvider {
  static value(
    @inject(RestBindings.Http.CONTEXT) context: Context,
    @inject(RestBindings.HANDLER) handler: HttpHandler,
  ): FindRoute {
    const findRoute: FindRoute = request => {
      const found = handler.findRoute(request);
      debug(
        'Route found for %s %s',
        request.method,
        request.originalUrl,
        found,
      );
      found.updateBindings(context);
      return found;
    };
    return findRoute;
  }
}

@injectable(
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
