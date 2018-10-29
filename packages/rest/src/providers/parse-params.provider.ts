// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Provider, inject} from '@loopback/context';
import {parseOperationArgs} from '../parser';
import {RestBindings} from '../keys';
import {ResolvedRoute} from '../router';
import {Request, ParseParams, RequestBodyParserOptions} from '../types';
import {
  RequestBodyParser,
  BodyParser,
  REQUEST_BODY_PARSER_TAG,
} from '../body-parser';
/**
 * Provides the function for parsing args in requests at runtime.
 *
 * @export
 * @class ParseParamsProvider
 * @implements {Provider<ParseParams>}
 * @returns {ParseParams} The handler function that will parse request args.
 */
export class ParseParamsProvider implements Provider<ParseParams> {
  private requestBodyParser: RequestBodyParser;

  constructor(
    @inject(RestBindings.REQUEST_BODY_PARSER_OPTIONS, {optional: true})
    options?: RequestBodyParserOptions,
    @inject.tag(REQUEST_BODY_PARSER_TAG, {optional: true})
    parsers: BodyParser[] = [],
  ) {
    this.requestBodyParser = new RequestBodyParser(options, parsers);
  }
  value() {
    return (request: Request, route: ResolvedRoute) =>
      parseOperationArgs(request, route, this.requestBodyParser);
  }
}
