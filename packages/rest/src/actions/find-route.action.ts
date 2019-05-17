// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, Context, inject, Next} from '@loopback/context';
import {HttpHandler} from '../http-handler';
import {RestBindings} from '../keys';
import {RouteEntry} from '../router';
import {HandlerContext, Request, RestAction, restAction} from '../types';

@restAction('route')
export class FindRouteAction implements RestAction {
  constructor(
    @inject.context()
    private context: Context,
    @inject.binding(RestBindings.RESOLVED_ROUTE)
    protected resolvedRouteBinding: Binding<RouteEntry>,
    @inject(RestBindings.HANDLER) protected handler: HttpHandler,
  ) {}

  action(ctx: HandlerContext, next: Next) {
    const found = this.findRoute(ctx.request);
    this.resolvedRouteBinding.to(found);
    return next();
  }

  findRoute(request: Request) {
    const found = this.handler.findRoute(request);
    found.updateBindings(this.context);
    return found;
  }
}
