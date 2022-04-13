// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import pEvent from 'p-event';
import io from 'socket.io-client';
import {SocketIoExampleApplication} from '../../application';

describe('SocketIoServer', () => {
  let app: SocketIoExampleApplication;

  before(givenApplication);

  after(async () => {
    await app.stop();
  });

  it('connects to socketio controller', async () => {
    const url = app.socketServer.url;
    const socket = io(url);

    socket.emit('general-message-forward', 'Hello');
    const msg = await pEvent(socket, 'general-message-forward');
    expect(msg).to.match('Hello');
    socket.disconnect();
  });

  async function givenApplication() {
    app = new SocketIoExampleApplication({
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
