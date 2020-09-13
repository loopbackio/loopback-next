// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/socket
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import pEvent from 'p-event';
import {SocketIODemoApplication} from './application';
import io = require('socket.io-client');

describe('SocketIOServer', () => {
  let app: SocketIODemoApplication;

  before(givenApplication);

  after(async () => {
    await app.stop();
  });

  it('connects to socketio controller', async () => {
    const url = app.options.ioServer.url + '/chats/group1';
    const socket = io(url);
    socket.emit('chat message', 'Hello');
    const msg = await pEvent(socket, 'chat message');
    expect(msg).to.match(/\[\/chats\/group1#.+\] Hello/);
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await socket.disconnect();
  });

  async function givenApplication() {
    app = new SocketIODemoApplication({
      socketio: {
        host: '127.0.0.1',
        port: 0,
      },
    });
    await app.start();
    return app;
  }
});
