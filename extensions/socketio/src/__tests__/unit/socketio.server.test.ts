// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {Namespace, Server} from 'socket.io';
import {SocketIoBindings} from '../../keys';
import {SocketIoComponent} from '../../socketio.component';
import {getNamespaceKeyForName, SocketIoServer} from '../../socketio.server';
import {
  DummyTestController,
  SampleTestController,
  SAMPLE_CONTROLER_NSP,
} from '../fixtures/ws-controllers';

describe('SocketIoServer', () => {
  let io: Server;
  let app: Application, socketServer: SocketIoServer;

  before(() => {
    app = new Application();
    app.component(SocketIoComponent);
    socketServer = new SocketIoServer(app);
    io = app.getSync(SocketIoBindings.IO);
  });

  it('should bind io Server instance to app', async () => {
    expect(io).to.be.not.null();
    // TODO: Check is a Server instance
    expect(io).to.be.a.instanceOf(Object);
  });

  it('should return io instance when registry without string route', () => {
    const nsp = socketServer.route(DummyTestController);
    expect(nsp).to.be.equal(io);
    // TODO: Check is a Namespace instance
    expect(nsp).to.be.a.instanceOf(Object);
  });

  it('should return a nsp when a string route is specific to it', () => {
    const stringNamespace = '/route/to/connect';
    const nsp = socketServer.route(
      DummyTestController,
      stringNamespace,
    ) as Namespace;
    expect(nsp.name).to.be.equal(stringNamespace);
  });

  it('should return a nsp when a regex route is specific it', () => {
    const regexNamespace = /\/regexnamespace/;
    const nsp = socketServer.route(
      DummyTestController,
      regexNamespace,
    ) as Namespace;
    // TODO: Check namespace regex
    expect(!!nsp.name).to.be.true();
  });

  it('should registry bind with the nsp when a name option is specific it', () => {
    const optionsName = 'customName';
    const nsp = socketServer.route(DummyTestController, {
      name: optionsName,
    }) as Namespace;
    const bindedNsp = app.getSync(getNamespaceKeyForName(optionsName));
    expect(bindedNsp).to.be.equal(nsp);
  });

  it('should return a nsp when a controller setup with socketio.controller decorator', () => {
    const nsp = socketServer.route(SampleTestController) as Namespace;
    expect(nsp.name).to.be.equal(SAMPLE_CONTROLER_NSP);
  });
});
