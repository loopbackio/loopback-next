// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Provider, inject} from '@loopback/context';
import {parseOperationArgs} from '../parser';
import {RestBindings} from '../keys';
import {ResolvedRoute} from '../router';
import {Request, ParseParams} from '../types';
import {RequestBodyParser} from '../body-parsers';
/**
 * Provides the function for parsing args in requests at runtime.
 *
 * @export
 * @class ParseParamsProvider
 * @implements {Provider<ParseParams>}
 * @returns {ParseParams} The handler function that will parse request args.
 */
export class ParseParamsProvider implements Provider<ParseParams> {
  constructor(
    @inject(RestBindings.REQUEST_BODY_PARSER)
    private requestBodyParser: RequestBodyParser,
  ) {}
  value() {
    return (request: Request, route: ResolvedRoute) =>
      parseOperationArgs(request, route, this.requestBodyParser);
  }
}
