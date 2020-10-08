// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import pEvent from 'p-event';
import {WebsocketApplication} from '../../websocket.application';
import {getNewFactory, withConnectedSockets} from '../fixtures/application';
import {
  MethodsTestController,
  SampleTestController,
  SAMPLE_CONTROLER_NSP,
} from '../fixtures/ws-controllers';

describe('Acceptance of Websocket extension', () => {
  let app: WebsocketApplication;

  before(async () => {
    app = new WebsocketApplication({
      websocket: {
        config: {
          host: '127.0.0.1',
          port: 0,
        },
      },
    });
    app.websocketServer.route(SampleTestController);
    app.websocketServer.route(MethodsTestController);
    await app.start();
  });

  after(async () => {
    await app.stop();
  });

  it('connects to socketio controller', () =>
    withConnectedSockets(app, SAMPLE_CONTROLER_NSP, async (client, _server) => {
      let err;
      try {
        await pEvent(client, 'connect');
      } catch (error) {
        err = error;
      }
      expect(!!err).to.be.false();
    }));

  it('subscribed methods must return the expect value', () =>
    withConnectedSockets(app, SAMPLE_CONTROLER_NSP, async (client, _server) => {
      const randomNumber = parseInt(`${Math.random() * 1000}`, 10);

      await pEvent(client, 'connect');

      const result = await new Promise((resolve, _reject) => {
        client.emit('oneEvent', {randomNumber}, resolve);
      });

      expect(result).to.be.eql({
        result: {
          text: `the number is ${randomNumber}`,
        },
      });
    }));

  it('emit events to clients', () =>
    withConnectedSockets(app, SAMPLE_CONTROLER_NSP, async (client, _server) => {
      const randomNumber = parseInt(`${Math.random() * 1000}`, 10);

      const promiseResult = pEvent(client, 'anotherEvent response');
      client.emit('anotherEvent', {randomNumber});
      const result = await promiseResult;

      expect(result).to.be.equal(`this is another number: ${randomNumber}`);
    }));

  it('subscribed methods must be called on', () =>
    withConnectedSockets(app, SAMPLE_CONTROLER_NSP, async (client, server) => {
      const factory = getNewFactory(app, MethodsTestController, server);
      const createdController: unknown = await factory.create();
      const controller = createdController as MethodsTestController;
      const emitAntWait = async (eventName: string, args: unknown) => {
        client.emit(eventName, args);
        await pEvent(server, eventName);
      };

      await emitAntWait('firstEventName1', []);
      await emitAntWait('firstEventName2', []);
      await emitAntWait('secondEventName', []);
      await emitAntWait('thirdEventName', []);
      await emitAntWait('secondEventName', []);
      await emitAntWait('otherSecondEventName', []);
      await emitAntWait('fourthEventName', []);
      await emitAntWait('fifthEventName', []);

      expect(controller.calledMethods).to.be.containEql({
        onConnectOne: 1,
        onConnectTwo: 1,
        firstMethod: 2,
        secondMethod: 3,
        thirdMethod: 1,
        topMethods: 6,
        onDisconnect: 0,
        fourthMethod1: 1,
        fourthMethod2: 1,
        fifthMethod: 1,
      });
    }));
});
