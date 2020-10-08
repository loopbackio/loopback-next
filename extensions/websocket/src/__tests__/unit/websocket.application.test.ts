// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {WebsocketApplication} from '../../websocket.application';

describe('WebsocketApplication', () => {
  let app: WebsocketApplication;

  before(async () => {
    app = new WebsocketApplication();
  });

  it('app bind io Server instance', async () => {
    expect(!!app.websocketServer).to.be.true();
  });
});
