// Copyright IBM Corp. and LoopBack contributors 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {text} from 'body-parser';
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

export class TextBodyParser implements BodyParser {
  name = builtinParsers.text;
  private textParser: BodyParserMiddleware;

  constructor(
    @inject(RestBindings.REQUEST_BODY_PARSER_OPTIONS, {optional: true})
    options: RequestBodyParserOptions = {},
  ) {
    const textOptions = Object.assign(
      {type: 'text/*'},
      getParserOptions('text', options),
    );
    this.textParser = text(textOptions);
  }

  supports(mediaType: string) {
    // Please note that `text/*` matches `text/plain` and `text/html` but`text`
    // does not.
    return !!is(mediaType, 'text/*');
  }

  async parse(request: Request): Promise<RequestBody> {
    const body = await invokeBodyParserMiddleware(this.textParser, request);
    return {value: body};
  }
}
