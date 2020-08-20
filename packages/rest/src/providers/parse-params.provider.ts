// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, inject, Provider} from '@loopback/core';
import {asMiddleware, Middleware} from '@loopback/express';
import debugFactory from 'debug';
import {RequestBodyParser} from '../body-parsers';
import {RestBindings, RestTags} from '../keys';
import {parseOperationArgs} from '../parser';
import {ResolvedRoute} from '../router';
import {RestMiddlewareGroups} from '../sequence';
import {AjvFactory, ParseParams, Request, ValidationOptions} from '../types';
import {DEFAULT_AJV_VALIDATION_OPTIONS} from '../validation/ajv-factory.provider';

const debug = debugFactory('loopback:rest:parse-param');

/**
 * Provides the function for parsing args in requests at runtime.
 *
 * @returns The handler function that will parse request args.
 */
export class ParseParamsProvider implements Provider<ParseParams> {
  constructor(
    @inject(RestBindings.REQUEST_BODY_PARSER)
    private requestBodyParser: RequestBodyParser,
    @inject(
      RestBindings.REQUEST_BODY_PARSER_OPTIONS.deepProperty('validation'),
      {optional: true},
    )
    private validationOptions: ValidationOptions = DEFAULT_AJV_VALIDATION_OPTIONS,
    @inject(RestBindings.AJV_FACTORY, {optional: true})
    private ajvFactory?: AjvFactory,
  ) {}

  value(): ParseParams {
    return (request: Request, route: ResolvedRoute) =>
      parseOperationArgs(request, route, this.requestBodyParser, {
        ajvFactory: this.ajvFactory,
        ...this.validationOptions,
      });
  }
}

@bind(
  asMiddleware({
    group: RestMiddlewareGroups.PARSE_PARAMS,
    upstreamGroups: RestMiddlewareGroups.FIND_ROUTE,
    chain: RestTags.REST_MIDDLEWARE_CHAIN,
  }),
)
export class ParseParamsMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @inject(RestBindings.SequenceActions.PARSE_PARAMS)
    protected parseParams: ParseParams,
  ) {}

  value(): Middleware {
    return async (ctx, next) => {
      const route: ResolvedRoute = await ctx.get(RestBindings.Operation.ROUTE);
      debug('Parsing parameters for %s %s', route.verb, route.path);
      const params = await this.parseParams(ctx.request, route);
      ctx.bind(RestBindings.Operation.PARAMS).to(params);
      debug('Parameters', params);
      return next();
    };
  }
}
