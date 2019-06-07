// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject, Next} from '@loopback/context';
import {HttpHandler} from '../http-handler';
import {RestBindings} from '../keys';
import {FindRoute, HttpContext, Request, restAction} from '../types';
import {BaseRestAction} from './base-action';

/**
 * Find a route matching the incoming REST API request.
 * Throw an error when no route was found.
 */
@restAction('route')
export class FindRouteAction extends BaseRestAction {
  constructor(
    @inject(RestBindings.Http.CONTEXT) protected context: Context,
    @inject(RestBindings.HANDLER) protected httpHandler: HttpHandler,
  ) {
    super();
  }

  async intercept(ctx: HttpContext, next: Next) {
    const found = await this.delegate(ctx, 'findRoute');
    // Bind resolved route
    ctx.bind(RestBindings.RESOLVED_ROUTE).to(found);
    return await next();
  }

  findRoute(@inject(RestBindings.Http.REQUEST) request: Request) {
    const found = this.httpHandler.findRoute(request);
    found.updateBindings(this.context);
    return found;
  }

  get handler(): FindRoute {
    return this.findRoute.bind(this);
  }
}
