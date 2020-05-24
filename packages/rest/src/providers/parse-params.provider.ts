// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {RequestBodyParser} from '../body-parsers';
import {RestBindings} from '../keys';
import {parseOperationArgs} from '../parser';
import {ResolvedRoute} from '../router';
import {
  AjvFactory,
  ParseParams,
  Request,
  RequestBodyValidationOptions,
} from '../types';
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
    validationOptions: RequestBodyValidationOptions = {},
    @inject(RestBindings.AJV_FACTORY, {optional: true})
    ajvFactory?: AjvFactory,
  ): ParseParams {
    const parseParams: ParseParams = (request: Request, route: ResolvedRoute) =>
      parseOperationArgs(request, route, requestBodyParser, {
        ajvFactory: ajvFactory,
        ...validationOptions,
      });
    return parseParams;
  }
}
