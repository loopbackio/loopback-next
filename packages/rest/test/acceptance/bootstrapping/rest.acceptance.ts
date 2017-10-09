// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, supertest} from '@loopback/testlab';
import {
  DefaultSequence,
  RestBindings,
  RestServer,
  RestComponent,
} from '../../..';
import {Application} from '@loopback/core';

describe('Bootstrapping with RestComponent', () => {
  context('with a user-defined sequence', () => {
    let app: Application;
    let server: RestServer;
    before(givenAppWithUserDefinedSequence);

    it('binds the `sequence` key to the user-defined sequence', async () => {
      const binding = await server.get(RestBindings.SEQUENCE);
      expect(binding.constructor.name).to.equal('UserDefinedSequence');
    });

    async function givenAppWithUserDefinedSequence() {
      class UserDefinedSequence extends DefaultSequence {}
      app = new Application({
        components: [RestComponent],
        servers: {
          RestServer: {
            type: RestServer,
            sequence: UserDefinedSequence,
            port: 0,
          },
        },
      });
      server = await app.getServer(RestServer);
    }
  });
});

describe('Starting the application', () => {
  // tslint:disable-next-line:no-any
  function helloHandler(sequence: any, request: any, response: any) {
    sequence.send(response, 'hello world');
  }
  it('starts an HTTP server', async () => {
    const app = new Application({
      components: [RestComponent],
      RestServer: {
        port: 0,
      },
    });
    const server = await app.getServer(RestServer);
    server.handler(helloHandler);

    await app.start();
    const port = await server.get(RestBindings.PORT);

    await supertest(`http://localhost:${port}`)
      .get('/')
      .expect(200, 'hello world');
    await app.stop();
  });

  it('can configure multiple HTTP servers', async () => {
    const app = new Application({
      components: [CustomRestComponent],
      servers: {
        first: {
          type: RestServer,
          port: 0,
        },
        second: {
          type: RestServer,
          port: 0,
        },
      },
    });
    const server1 = (await app.getServer('first')) as RestServer;
    const server2 = (await app.getServer('second')) as RestServer;

    server1.handler(helloHandler);
    server2.handler(helloHandler);

    await app.start();
    const port1 = await server1.get(RestBindings.PORT);
    const port2 = await server2.get(RestBindings.PORT);

    await supertest(`http://localhost:${port1}`)
      .get('/')
      .expect(200, 'hello world');
    await supertest(`http://localhost:${port2}`)
      .get('/')
      .expect(200, 'hello world');
    await app.stop();
  });

  class CustomRestComponent extends RestComponent {
    servers = {};
  }
});
