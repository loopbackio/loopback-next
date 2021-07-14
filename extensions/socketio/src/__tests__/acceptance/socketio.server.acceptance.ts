// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import pEvent from 'p-event';
import io from 'socket.io-client';
import {SocketIoDemoApplication} from '../fixtures/application';

describe('SocketIoServer', () => {
  let app: SocketIoDemoApplication;

  before(givenApplication);

  after(async () => {
    await app.stop();
  });

  it('connects to socketio controller', async () => {
    const url = app.socketServer.url + '/chats/group1';
    const socket = io(url);
    socket.emit('chat message', 'Hello');
    const msg = await pEvent(socket, 'chat message');
    expect(msg).to.match(/\[\/chats\/group1#.+\] Hello/);
    socket.disconnect();
  });

  async function givenApplication() {
    app = new SocketIoDemoApplication({
      httpServerOptions: {
        host: '127.0.0.1',
        port: 0,
      },
    });
    await app.boot();
    await app.start();

    return app;
  }
});
