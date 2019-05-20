// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject, Next} from '@loopback/context';
import {RequestBodyParser} from '../body-parsers';
import {RestBindings} from '../keys';
import {parseOperationArgs} from '../parser';
import {ResolvedRoute} from '../router';
import {
  HttpContext,
  ParseParams,
  Request,
  RestAction,
  restAction,
} from '../types';

/**
 * Provides the function for parsing args in requests at runtime.
 *
 * @returns The handler function that will parse request args.
 */
@restAction('parseParams')
export class ParseParamsAction implements RestAction {
  constructor(
    @inject.getter(RestBindings.RESOLVED_ROUTE)
    private getRoute: Getter<ResolvedRoute>,
    @inject(RestBindings.REQUEST_BODY_PARSER)
    private requestBodyParser: RequestBodyParser,
  ) {}

  async action(ctx: HttpContext, next: Next) {
    const args = await this.parseParams(ctx.request, await this.getRoute());
    ctx.bind(RestBindings.OPERATION_ARGS).to(args);
    return await next();
  }

  async parseParams(request: Request, resolvedRoute: ResolvedRoute) {
    return await parseOperationArgs(
      request,
      resolvedRoute,
      this.requestBodyParser,
    );
  }

  get handler(): ParseParams {
    return this.parseParams.bind(this);
  }
}
