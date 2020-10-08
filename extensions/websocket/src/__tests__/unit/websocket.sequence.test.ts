import {expect} from '@loopback/testlab';
import {Socket} from 'socket.io';
import {WebsocketBindings} from '../../keys';
import {WebsocketControllerFactory} from '../../websocket-controller-factory';
import {WebsocketApplication} from '../../websocket.application';
import {getNewFactory} from '../fixtures/application';
import {DummySocket} from '../fixtures/dummy-socket';
import {SequenceTestController} from '../fixtures/ws-controllers';

describe('WebsocketSequence', () => {
  let app: WebsocketApplication;
  let factory: WebsocketControllerFactory;
  const dummySocket = new DummySocket();

  const callMethod = async (methdName: string, args: unknown) => {
    const callback = factory.getCallback(methdName);
    return new Promise(resolve => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callback(args, resolve);
    });
  };

  describe('with a default providers values', () => {
    before(async () => {
      app = new WebsocketApplication();
      app.websocketServer.route(SequenceTestController);
      factory = getNewFactory(
        app,
        SequenceTestController,
        (dummySocket as Object) as Socket,
      );
      await factory.create();
    });

    it('callback response with success', async () => {
      const text = 'this is first param';
      const response = await callMethod('responseSuccess', {
        oneParam: text,
      });
      expect(!!response).to.be.true();
      expect(response).to.be.eql({
        result: {text: `yes you are the first params: ${text}`},
      });
    });

    it('callback response with error handling', async () => {
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

  describe('with a distinct providers values', () => {
    before(async () => {
      app = new WebsocketApplication();
      app.websocketServer.route(SequenceTestController);
      factory = getNewFactory(
        app,
        SequenceTestController,
        (dummySocket as Object) as Socket,
      );
      await factory.create();

      app
        .bind(WebsocketBindings.INVOKE_METHOD)
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

      app.bind(WebsocketBindings.SEND_METHOD).to((done, result) => {
        done({myBody: result});
      });

      app.bind(WebsocketBindings.REJECT_METHOD).to((done, error) => {
        done({myAppErrorMessage: error.message});
      });
    });

    it('callback response with success', async () => {
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

    it('callback response with error handling', async () => {
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
