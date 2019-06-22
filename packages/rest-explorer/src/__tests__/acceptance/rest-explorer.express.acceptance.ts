// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RestApplication, RestServer, RestServerConfig} from '@loopback/rest';
import {
  Client,
  createClientForHandler,
  givenHttpServerConfig,
} from '@loopback/testlab';
import * as express from 'express';
import {RestExplorerComponent} from '../..';

describe('REST Explorer mounted as an express router', () => {
  let client: Client;
  let expressApp: express.Application;
  let server: RestServer;
  beforeEach(givenLoopBackApp);
  beforeEach(givenExpressApp);
  beforeEach(givenClient);

  it('exposes API Explorer at "/api/explorer/"', async () => {
    await client
      .get('/api/explorer/')
      .expect(200)
      .expect('content-type', /html/)
      .expect(/url\: '\/api\/openapi\.json'\,/);
  });

  it('redirects from "/api/explorer" to "/api/explorer/"', async () => {
    await client
      .get('/api/explorer')
      .expect(301)
      .expect('location', '/api/explorer/');
  });

  it('uses correct URLs when basePath is set', async () => {
    server.basePath('/v1');
    await client
      // static assets (including swagger-ui) honor basePath
      .get('/api/v1/explorer/')
      .expect(200)
      .expect('content-type', /html/)
      // OpenAPI endpoints DO NOT honor basePath
      .expect(/url\: '\/api\/openapi\.json'\,/);
  });

  async function givenLoopBackApp(
    options: {rest: RestServerConfig} = {rest: {port: 0}},
  ) {
    options.rest = givenHttpServerConfig(options.rest);
    const app = new RestApplication(options);
    app.component(RestExplorerComponent);
    server = await app.getServer(RestServer);
  }

  /**
   * Create an express app that mounts the LoopBack routes to `/api`
   */
  function givenExpressApp() {
    expressApp = express();
    expressApp.use('/api', (req, res, _next) => {
      // defer calling of `server.requestHandler` until a request arrives
      server.requestHandler(req, res);
    });
  }

  function givenClient() {
    client = createClientForHandler(expressApp);
  }
});
