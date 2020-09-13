// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Socket} from 'socket.io';
import {SocketIoBindings} from '../../keys';
import {SocketIoControllerFactory} from '../../socketio-controller-factory';
import {SocketIoApplication} from '../../socketio.application';
import {DummySocket} from '../fixtures/dummy-socket';
import {getNewFactory} from '../fixtures/helpers';
import {SequenceTestController} from '../fixtures/ws-controllers';

describe('SocketIoSequence', () => {
  let app: SocketIoApplication;
  let factory: SocketIoControllerFactory;
  const dummySocket = new DummySocket();

  const callMethod = async (methdName: string, args: unknown) => {
    const callback = factory.getCallback(methdName);
    return new Promise(resolve => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callback(args, resolve);
    });
  };

  describe('Default provider callback', () => {
    before(async () => {
      app = new SocketIoApplication();
      app.socketServer.route(SequenceTestController);
      factory = getNewFactory(
        app,
        SequenceTestController,
        (dummySocket as Object) as Socket,
      );
      await factory.create();
    });

    it('should respond with success', async () => {
      const text = 'this is first param';
      const response = await callMethod('responseSuccess', {
        oneParam: text,
      });
      expect(!!response).to.be.true();
      expect(response).to.be.eql({
        result: {text: `yes you are the first params: ${text}`},
      });
    });

    it('should respond with error handling', async () => {
      const text = 'this is another param';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await callMethod('responseError', {
        badParam: text,
      });
      expect(!!response).to.be.true();
      expect(!!response.error).to.be.true();
      expect(response.error).to.have.containEql({
        message: `this is a badParam: ${text}`,
      });
    });
  });

  describe('Distinct providers callbacks', () => {
    before(async () => {
      app = new SocketIoApplication();
      app.socketServer.route(SequenceTestController);
      factory = getNewFactory(
        app,
        SequenceTestController,
        (dummySocket as Object) as Socket,
      );
      await factory.create();

      app
        .bind(SocketIoBindings.INVOKE_METHOD)
        .to((context, controller, methodName, args) => {
          if (methodName === 'responseSuccess') {
            return {
              invoqueMethod: 'customInvoqueMethod',
              methodName,
              args,
            };
          }
          throw new Error('Bad method name');
        });

      app.bind(SocketIoBindings.SEND_METHOD).to((done, result) => {
        done({myBody: result});
      });

      app.bind(SocketIoBindings.REJECT_METHOD).to((done, error) => {
        done({myAppErrorMessage: error.message});
      });
    });

    it('should respond with success', async () => {
      const text = 'this is first param';
      const response = await callMethod('responseSuccess', {
        oneParam: text,
      });
      expect(!!response).to.be.true();
      expect(response).to.be.eql({
        myBody: {
          invoqueMethod: 'customInvoqueMethod',
          methodName: 'responseSuccess',
          args: [{oneParam: text}],
        },
      });
    });

    it('should respond with error handling', async () => {
      const text = 'this is another param';
      const response: unknown = await callMethod('responseError', {
        badParam: text,
      });
      expect(!!response).to.be.true();
      expect(response).to.have.containEql({
        myAppErrorMessage: `Bad method name`,
      });
    });
  });
});
