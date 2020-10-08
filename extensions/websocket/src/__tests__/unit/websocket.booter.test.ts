import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {WebsocketApplication} from '../../websocket.application';
import path from 'path';
import io from 'socket.io-client';
import pEvent from 'p-event';
import {
  DECORATOR_TEST_CONTROLER_NSP,
  METHODS_TEST_CONTROLER_NSP,
  SAMPLE_CONTROLER_NSP,
  SEQUENCE_TEST_CONTROLER_NSP,
} from '../fixtures/ws-controllers';
import {WebsocketComponent} from '../../websocket.component';

class BooteablewebsocketApplication extends BootMixin(WebsocketApplication) {
  constructor(options: ApplicationConfig) {
    super(options);
    this.component(WebsocketComponent);
    this.projectRoot = path.join(__dirname, '../fixtures');
  }
}

describe('WebsocketBooter', () => {
  const givemeAnInstanceApplicaciontionRunning = async () => {
    const app = new BooteablewebsocketApplication({
      websocket: {
        host: '127.0.0.1',
        port: 0,
      },
    });
    await app.boot();
    await app.start();
    return app;
  };

  it('boot the applicacion dont must generate a error', async () => {
    let err;
    try {
      await givemeAnInstanceApplicaciontionRunning();
    } catch (error) {
      err = error;
      console.log(err);
    }
    expect(!!err).to.be.false();
  });

  describe('test connections to expected loaded controllers', () => {
    let app: BooteablewebsocketApplication;

    before(async () => {
      app = await givemeAnInstanceApplicaciontionRunning();
    });

    [
      {testMessage: 'dummy test controller', namespace: ''},
      {
        testMessage: 'sample test controller',
        namespace: SAMPLE_CONTROLER_NSP,
      },
      {
        testMessage: 'decorator test controller',
        namespace: DECORATOR_TEST_CONTROLER_NSP,
      },
      {
        testMessage: 'methods test controller',
        namespace: METHODS_TEST_CONTROLER_NSP,
      },
      {
        testMessage: 'sequence test controller',
        namespace: SEQUENCE_TEST_CONTROLER_NSP,
      },
    ].forEach(({testMessage, namespace}) => {
      it(testMessage, async () => {
        const client = io(app.websocketServer.url + namespace);
        let error;
        try {
          await pEvent(client, 'connect');
        } catch (err) {
          error = err;
          console.log('err', err);
        }
        expect(!!error).to.be.false();
      });
    });
  });
});
