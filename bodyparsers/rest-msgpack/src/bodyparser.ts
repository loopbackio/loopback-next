// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/bodyparser-msgpack
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {
  RawBodyParser,
  Request,
  RequestBody,
  RequestBodyParserOptions,
  RestBindings,
} from '@loopback/rest';
import {is} from 'type-is';
import {msgpack} from '.';

export class MsgPackBodyParser extends RawBodyParser {
  name = Symbol('msgpack');

  constructor(
    @inject(RestBindings.REQUEST_BODY_PARSER_OPTIONS, {optional: true})
    options: RequestBodyParserOptions = {},
  ) {
    super(options);
  }

  supports(mediaType: string) {
    return !!is(
      mediaType,
      'application/msgpack',
      'application/x-msgpack',
      'application/*+msgpack',
    );
  }

  async parse(request: Request): Promise<RequestBody> {
    const result = await super.parse(request);
    const body = msgpack.decode(result.value);

    return {
      value: body,
    };
  }
}
