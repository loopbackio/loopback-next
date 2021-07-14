// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest-msgpack
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, Component, inject} from '@loopback/core';
import {
  createBodyParserBinding,
  RawBodyParser,
  RestBindings,
} from '@loopback/rest';
import {MsgPackBodyParser, MsgPackBodyParserBindings} from '.';

export class MsgPackBodyParserComponent implements Component {
  bindings: Binding[] = [
    createBodyParserBinding(
      MsgPackBodyParser,
      MsgPackBodyParserBindings.BODY_PARSER,
    ),
  ];

  constructor(
    @inject(RestBindings.REQUEST_BODY_PARSER_RAW, {optional: true})
    rawBodyParser?: RawBodyParser,
  ) {
    if (!rawBodyParser)
      throw new Error('MessagePack body parser requires raw body parser.');
  }
}
