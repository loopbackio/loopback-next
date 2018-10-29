// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {urlencoded} from 'body-parser';
import {is} from 'type-is';
import {RestBindings} from '../keys';
import {Request, RequestBodyParserOptions} from '../types';
import {
  BodyParserMiddleware,
  getParserOptions,
  invokeBodyParserMiddleware,
  builtinParsers,
} from './body-parser.helpers';
import {BodyParser, RequestBody} from './types';

export class UrlEncodedBodyParser implements BodyParser {
  name = builtinParsers.urlencoded;
  private urlencodedParser: BodyParserMiddleware;

  constructor(
    @inject(RestBindings.REQUEST_BODY_PARSER_OPTIONS, {optional: true})
    options: RequestBodyParserOptions = {},
  ) {
    const urlencodedOptions = getParserOptions('urlencoded', options);
    this.urlencodedParser = urlencoded(urlencodedOptions);
  }

  supports(mediaType: string) {
    return !!is(mediaType, 'urlencoded');
  }

  async parse(request: Request): Promise<RequestBody> {
    const body = await invokeBodyParserMiddleware(
      this.urlencodedParser,
      request,
    );
    return {value: body, coercionRequired: true};
  }
}
