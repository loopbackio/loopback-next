// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, Context, inject, Provider} from '@loopback/core';
import {asMiddleware, Middleware} from '@loopback/express';
import {HttpHandler} from '../http-handler';
import {RestBindings, RestTags} from '../keys';
import {ResolvedRoute} from '../router';
import {RestMiddlewareGroups} from '../sequence';
import {FindRoute, Request} from '../types';

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
    found.updateBindings(this.context);
    return found;
  }
}

@bind(
  asMiddleware({
    group: RestMiddlewareGroups.FIND_ROUTE,
    chain: RestTags.REST_MIDDLEWARE_CHAIN,
  }),
)
export class FindRouteMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @inject(RestBindings.SequenceActions.FIND_ROUTE)
    protected findRoute: FindRoute,
  ) {}

  value(): Middleware {
    return async (ctx, next) => {
      const route = this.findRoute(ctx.request);
      ctx.bind(RestBindings.Operation.ROUTE).to(route);
      return next();
    };
  }
}
