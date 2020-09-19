// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/bodyparser-msgpack
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RestApplication, RestBindings} from '@loopback/rest';
import {expect} from '@loopback/testlab';
import {
  MsgPackBodyParser,
  MsgPackBodyParserBindings,
  MsgPackBodyParserComponent,
} from '../..';

describe('MessagePack body parser component', () => {
  it('binds MessagePack body parser', async () => {
    const restApplication = new RestApplication();
    restApplication.component(MsgPackBodyParserComponent);

    expect(
      await restApplication.get(MsgPackBodyParserBindings.BODY_PARSER),
    ).to.be.instanceOf(MsgPackBodyParser);
  });

  it('throws error without raw body parser', async () => {
    const restApplication = new RestApplication();
    restApplication.unbind(RestBindings.REQUEST_BODY_PARSER_RAW);

    expect(() =>
      restApplication.component(MsgPackBodyParserComponent),
    ).to.throw();
  });
});
