// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {get} from '@loopback/openapi-v3';
import {
  Client,
  createClientForHandler,
  expect,
  givenHttpServerConfig,
} from '@loopback/testlab';
import * as express from 'express';
import {RestComponent} from '../../rest.component';
import {
  HttpRequestListener,
  RestServer,
  RestServerConfig,
} from '../../rest.server';

describe('HttpHandler mounted as an express router', () => {
  let client: Client;
  beforeEach(givenLoopBackApp);
  beforeEach(givenExpressApp);
  beforeEach(givenClient);

  context('with a simple HelloWorld controller', () => {
    beforeEach(function setupHelloController() {
      class HelloController {
        @get('/hello')
        public async greet(): Promise<string> {
          return 'Hello world!';
        }
      }

      givenControllerClass(HelloController);
    });

    it('handles simple "GET /hello" requests', () => {
      return client
        .get('/api/hello')
        .expect(200)
        .expect('content-type', 'text/plain')
        .expect('Hello world!');
    });

    it('handles openapi.json', async () => {
      const res = await client
        .get('/api/openapi.json')
        .set('Accept', 'application/json')
        .expect(200);
      expect(res.body.servers[0]).to.eql({url: '/api'});
    });
  });

  let expressApp: express.Application;
  let server: RestServer;
  let handler: HttpRequestListener;

  function givenControllerClass(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctor: new (...args: any[]) => object,
  ) {
    server.controller(ctor);
  }

  async function givenLoopBackApp(
    options: {rest: RestServerConfig} = {rest: {port: 0}},
  ) {
    options.rest = givenHttpServerConfig(options.rest);
    const app = new Application(options);
    app.component(RestComponent);
    server = await app.getServer(RestServer);
    handler = server.requestHandler;
  }

  /**
   * Create an express app that mounts the LoopBack routes to `/api`
   */
  function givenExpressApp() {
    expressApp = express();
    expressApp.use('/api', handler);
  }

  function givenClient() {
    client = createClientForHandler(expressApp);
  }
});
