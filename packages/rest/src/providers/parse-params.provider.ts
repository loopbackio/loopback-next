// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject, Provider} from '@loopback/context';
import {RequestBodyParser} from '../body-parsers';
import {RestBindings} from '../keys';
import {parseOperationArgs} from '../parser';
import {ResolvedRoute} from '../router';
import {ParseParams, Request, RequestBodyParserOptions} from '../types';
/**
 * Provides the function for parsing args in requests at runtime.
 *
 * @returns The handler function that will parse request args.
 */
export class ParseParamsProvider implements Provider<ParseParams> {
  constructor(
    @inject(RestBindings.REQUEST_BODY_PARSER)
    private requestBodyParser: RequestBodyParser,
    @inject(RestBindings.REQUEST_BODY_PARSER_OPTIONS, {optional: true})
    private options: RequestBodyParserOptions = {},
  ) {}
  value() {
    return (request: Request, route: ResolvedRoute) =>
      parseOperationArgs(
        request,
        route,
        this.requestBodyParser,
        this.options.validation,
      );
  }
}
