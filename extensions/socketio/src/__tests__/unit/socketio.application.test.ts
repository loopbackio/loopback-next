// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {SocketIoApplication} from '../../socketio.application';

describe('SocketIoApplication', () => {
  let app: SocketIoApplication;

  before(async () => {
    app = new SocketIoApplication();
  });

  it('should bind io Server instance to app', async () => {
    expect(!!app.socketServer).to.be.true();
  });
});
