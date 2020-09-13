// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {invokeMethod} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {Namespace, Server, Socket} from 'socket.io';
import {SocketIoBindings} from '../../keys';
import {SocketIoControllerFactory} from '../../socketio-controller-factory';
import {SocketIoApplication} from '../../socketio.application';
import {DummySocket} from '../fixtures/dummy-socket';
import {getNewFactory} from '../fixtures/helpers';
import {
  DecoratorTestController,
  DECORATOR_TEST_CONTROLER_NSP,
} from '../fixtures/ws-controllers';

describe('SocketIo decorators', () => {
  let app: SocketIoApplication;
  let factory: SocketIoControllerFactory;
  let createdController: unknown;
  let controller: DecoratorTestController;
  let appIo: Server;
  const dummySocket = new DummySocket();

  before(async () => {
    app = new SocketIoApplication();
    app.socketServer.route(DecoratorTestController);
    factory = getNewFactory(
      app,
      DecoratorTestController,
      (dummySocket as Object) as Socket,
    );
    createdController = await factory.create();
    controller = createdController as DecoratorTestController;
    appIo = await app.get(SocketIoBindings.IO);
  });

  it('must inject the socket connection', async () => {
    const socket: Socket = await invokeMethod(
      controller,
      'methodMustReturnSocket',
      factory.connCtx,
    );
    expect(socket).to.be.equal(dummySocket);
  });

  it('must inject SocketIo instance', async () => {
    const io: Server = await invokeMethod(
      controller,
      'methodMustReturnIoInstance',
      factory.connCtx,
    );
    expect(io).to.be.equal(appIo);
  });

  it('must inject a namespace instance', async () => {
    const expectedNsp = appIo.of(DECORATOR_TEST_CONTROLER_NSP);
    const nsp: Namespace = await invokeMethod(
      controller,
      'methodMustReturnNamespace',
      factory.connCtx,
    );
    expect(nsp).to.be.equal(expectedNsp);
  });
});
