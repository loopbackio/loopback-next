// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/rest-msgpack
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
import msgpack from 'msgpack5';
import {is} from 'type-is';

export class MsgPackBodyParser extends RawBodyParser {
  name = Symbol('msgpack');
  private _msgpack = msgpack();

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
    const body = this._msgpack.decode(result.value);

    return {
      value: body,
    };
  }
}
