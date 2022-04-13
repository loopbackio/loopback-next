// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingScope, inject, injectable, Provider} from '@loopback/core';
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
export class ParseParamsProvider {
  static value(
    @inject(RestBindings.REQUEST_BODY_PARSER)
    requestBodyParser: RequestBodyParser,
    @inject(
      RestBindings.REQUEST_BODY_PARSER_OPTIONS.deepProperty('validation'),
      {optional: true},
    )
    validationOptions: ValidationOptions = DEFAULT_AJV_VALIDATION_OPTIONS,
    @inject(RestBindings.AJV_FACTORY, {optional: true})
    ajvFactory: AjvFactory,
  ): ParseParams {
    const parseParams: ParseParams = (request: Request, route: ResolvedRoute) =>
      parseOperationArgs(request, route, requestBodyParser, {
        ajvFactory: ajvFactory,
        ...validationOptions,
      });
    return parseParams;
  }
}

@injectable(
  asMiddleware({
    group: RestMiddlewareGroups.PARSE_PARAMS,
    upstreamGroups: RestMiddlewareGroups.FIND_ROUTE,
    chain: RestTags.REST_MIDDLEWARE_CHAIN,
  }),
  {scope: BindingScope.SINGLETON},
)
export class ParseParamsMiddlewareProvider implements Provider<Middleware> {
  value(): Middleware {
    return async (ctx, next) => {
      const requestBodyParser = await ctx.get(RestBindings.REQUEST_BODY_PARSER);
      const validationOptions: ValidationOptions =
        (await ctx.get(
          RestBindings.REQUEST_BODY_PARSER_OPTIONS.deepProperty('validation'),
          {optional: true},
        )) ?? DEFAULT_AJV_VALIDATION_OPTIONS;
      const ajvFactory = await ctx.get(RestBindings.AJV_FACTORY, {
        optional: true,
      });

      const route: ResolvedRoute = await ctx.get(RestBindings.Operation.ROUTE);
      debug('Parsing parameters for %s %s', route.verb, route.path);
      const params = await parseOperationArgs(
        ctx.request,
        route,
        requestBodyParser,
        {
          ajvFactory: ajvFactory,
          ...validationOptions,
        },
      );
      ctx.bind(RestBindings.Operation.PARAMS).to(params);
      debug('Parameters', params);
      return next();
    };
  }
}
