// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CoreBindings} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {Socket} from 'socket.io';
import {SocketIoBindings} from '../../keys';
import {SocketIoControllerFactory} from '../../socketio-controller-factory';
import {SocketIoApplication} from '../../socketio.application';
import {DummySocket} from '../fixtures/dummy-socket';
import {getNewFactory} from '../fixtures/helpers';
import {
  DummyTestController,
  MethodsTestController,
} from '../fixtures/ws-controllers';

describe('SocketIoControllerFactory', () => {
  let app: SocketIoApplication;
  const dummySocket = new DummySocket();

  before(async () => {
    app = new SocketIoApplication();
  });

  it('must instantiate a ws controller factory', () => {
    expect(
      !!getNewFactory(
        app,
        DummyTestController,
        dummySocket as Object as Socket,
      ),
    ).to.be.true();
  });

  describe('after create SocketIoControllerFactory instance', () => {
    let factory: SocketIoControllerFactory;
    let createdController: unknown;

    before(async () => {
      factory = getNewFactory(
        app,
        MethodsTestController,
        dummySocket as Object as Socket,
      );
      createdController = await factory.create();
    });

    it('must return a instance of controller for a socket connection', () => {
      expect(createdController).to.be.a.instanceOf(MethodsTestController);
    });

    it('must bind socket', () => {
      const socket = factory.connCtx.getSync(SocketIoBindings.SOCKET);
      expect(socket).to.be.equal(dummySocket);
    });

    it('must bind controller constructor', () => {
      const controllerConstructor = factory.connCtx.getSync(
        CoreBindings.CONTROLLER_CLASS,
      );
      expect(controllerConstructor).to.be.equal(MethodsTestController);
    });

    it('must bind controller instance', () => {
      const controllerInstance = factory.connCtx.getSync(
        CoreBindings.CONTROLLER_CURRENT,
      );
      expect(controllerInstance).to.be.equal(createdController);
    });

    it('should get decorated methods for @socketio.connect()', () => {
      const methodsForConnection = factory.getDecoratedMethodsForConnect();
      expect(methodsForConnection).to.be.containEql({
        onConnectOne: true,
        onConnectTwo: true,
      });
    });

    it('should get decorated methods for @socketio.subscribe() by string and by regex', () => {
      const methodsResult = factory.getDecorateSubscribeMethodsByEventName();
      expect(methodsResult).to.be.containEql({
        firstEventName1: {
          matcher: 'firstEventName1',
          methodNames: ['firstMethod', 'topMethods'],
        },
        firstEventName2: {
          matcher: 'firstEventName2',
          methodNames: ['firstMethod', 'topMethods'],
        },
        secondEventName: {
          matcher: 'secondEventName',
          methodNames: ['secondMethod', 'topMethods'],
        },
        thirdEventName: {
          matcher: 'thirdEventName',
          methodNames: ['thirdMethod', 'topMethods'],
        },
        '/^otherSecondEventName$/': {
          matcher: /^otherSecondEventName$/,
          methodNames: ['secondMethod', 'topMethods'],
        },
        '/^fourthEventName$/': {
          matcher: /^fourthEventName$/,
          methodNames: ['fourthMethod1', 'fourthMethod2'],
        },
        '/^fifthEventName$/': {
          matcher: /^fifthEventName$/,
          methodNames: ['fifthMethod'],
        },
        disconnect: {
          matcher: 'disconnect',
          methodNames: ['onDisconnect'],
        },
      });
    });
  });
});
