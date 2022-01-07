// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {pEvent} from 'p-event';
import path from 'path';
import io from 'socket.io-client';
import {SocketIoApplication} from '../../socketio.application';
import {
  DECORATOR_TEST_CONTROLER_NSP,
  METHODS_TEST_CONTROLER_NSP,
  SAMPLE_CONTROLER_NSP,
  SEQUENCE_TEST_CONTROLER_NSP,
} from '../fixtures/ws-controllers';

class BooteableSocketIoApplication extends BootMixin(SocketIoApplication) {
  constructor(options: ApplicationConfig) {
    super(options);
    this.projectRoot = path.join(__dirname, '../fixtures');
  }
}

describe('SocketIoBooter', () => {
  const getRunningApplication = async () => {
    const app = new BooteableSocketIoApplication({
      httpServerOptions: {
        host: '127.0.0.1',
        port: 0,
      },
      socketIOOptions: {},
    });
    await app.boot();
    await app.start();
    return app;
  };

  it('should not generate error while booting application', async () => {
    let err;
    try {
      await getRunningApplication();
    } catch (error) {
      err = error;
      console.log(err);
    }
    expect(!!err).to.be.false();
  });

  describe('Connection to controllers', () => {
    let app: BooteableSocketIoApplication;

    before(async () => {
      app = await getRunningApplication();
    });

    [
      {testMessage: 'should connect to dummy test controller', namespace: ''},
      {
        testMessage: 'should connect to sample test controller',
        namespace: SAMPLE_CONTROLER_NSP,
      },
      {
        testMessage: 'should connect to decorator test controller',
        namespace: DECORATOR_TEST_CONTROLER_NSP,
      },
      {
        testMessage: 'should connect to methods test controller',
        namespace: METHODS_TEST_CONTROLER_NSP,
      },
      {
        testMessage: 'should connect to sequence test controller',
        namespace: SEQUENCE_TEST_CONTROLER_NSP,
      },
    ].forEach(({testMessage, namespace}) => {
      it(testMessage, async () => {
        const client = io(app.socketServer.url + namespace);
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
