// Copyright IBM Corp. and LoopBack contributors 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {raw} from 'body-parser';
import {is} from 'type-is';
import {RestBindings} from '../keys';
import {Request, RequestBodyParserOptions} from '../types';
import {
  BodyParserMiddleware,
  builtinParsers,
  getParserOptions,
  invokeBodyParserMiddleware,
} from './body-parser.helpers';
import {BodyParser, RequestBody} from './types';

/**
 * Parsing the request body into Buffer
 */
export class RawBodyParser implements BodyParser {
  name = builtinParsers.raw;
  private rawParser: BodyParserMiddleware;

  constructor(
    @inject(RestBindings.REQUEST_BODY_PARSER_OPTIONS, {optional: true})
    options: RequestBodyParserOptions = {},
  ) {
    const rawOptions = getParserOptions('raw', options);
    this.rawParser = raw(rawOptions);
  }

  supports(mediaType: string) {
    return !!is(mediaType, 'application/octet-stream');
  }

  async parse(request: Request): Promise<RequestBody> {
    const body = await invokeBodyParserMiddleware(this.rawParser, request);
    return {value: body};
  }
}
