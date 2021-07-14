// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {json} from 'body-parser';
import {is} from 'type-is';
import {RestBindings} from '../keys';
import {sanitizeJsonParse} from '../parse-json';
import {Request, RequestBodyParserOptions} from '../types';
import {
  BodyParserMiddleware,
  builtinParsers,
  getParserOptions,
  invokeBodyParserMiddleware,
} from './body-parser.helpers';
import {BodyParser, RequestBody} from './types';

export class JsonBodyParser implements BodyParser {
  name = builtinParsers.json;
  private jsonParser: BodyParserMiddleware;

  constructor(
    @inject(RestBindings.REQUEST_BODY_PARSER_OPTIONS, {optional: true})
    options: RequestBodyParserOptions = {},
  ) {
    const jsonOptions = getParserOptions('json', options);
    const prohibitedKeys = [
      '__proto__',
      'constructor.prototype',
      ...(options.validation?.prohibitedKeys ?? []),
    ];
    jsonOptions.reviver = sanitizeJsonParse(
      jsonOptions.reviver,
      prohibitedKeys,
    );
    this.jsonParser = json(jsonOptions);
  }

  supports(mediaType: string) {
    return !!is(mediaType, '*/json', '*/*+json');
  }

  async parse(request: Request): Promise<RequestBody> {
    let body = await invokeBodyParserMiddleware(this.jsonParser, request);
    // https://github.com/expressjs/body-parser/blob/master/lib/types/json.js#L71-L76
    const contentLength = request.get('content-length');
    if (contentLength != null && +contentLength === 0) {
      body = undefined;
    }
    return {value: body};
  }
}
