// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, supertest} from '@loopback/testlab';
import {Constructor, Provider, inject} from '@loopback/context';
import {
  DefaultSequence,
  RestBindings,
  RestServer,
  RestComponent,
} from '../../..';
import {Application, ControllerClass} from '@loopback/core';

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
        rest: {
          sequence: UserDefinedSequence,
          port: 0,
        },
      });
      server = await app.getServer(RestServer);
    }
  });
});

describe('Starting the application', () => {
  it('starts an HTTP server', async () => {
    const app = new Application({
      components: [RestComponent],
      rest: {
        port: 0,
      },
    });
    const server = await app.getServer(RestServer);
    server.handler((sequence, request, response) => {
      sequence.send(response, 'hello world');
    });

    await app.start();
    const port = await server.get(RestBindings.PORT);

    await supertest(`http://localhost:${port}`)
      .get('/')
      .expect(200, 'hello world');
    await app.stop();
  });
});
