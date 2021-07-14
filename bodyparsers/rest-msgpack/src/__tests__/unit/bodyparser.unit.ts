// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest-msgpack
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {MsgPackBodyParser} from '../..';

describe('MessagePack body parser', () => {
  const contentTypes = [
    'application/msgpack',
    'application/x-msgpack',
    'application/subtype+msgpack',
  ];

  let bodyParser: MsgPackBodyParser;

  beforeEach(givenBodyParser);

  for (const contentType of contentTypes) {
    it(`accepts ${contentType}`, () => {
      expect(bodyParser.supports(contentType)).to.be.true();
    });
  }

  function givenBodyParser() {
    bodyParser = new MsgPackBodyParser();
  }
});
