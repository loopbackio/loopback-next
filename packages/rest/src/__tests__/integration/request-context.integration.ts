// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ApplicationConfig} from '@loopback/core';
import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
  supertest,
  httpsGetAsync,
} from '@loopback/testlab';
import * as express from 'express';
import {RequestContext} from '../../request-context';
import {RestApplication} from '../../rest.application';
import {RestServerConfig} from '../../rest.server';
import {DefaultSequence} from '../../sequence';

let app: RestApplication;
let client: Client;
let observedCtx: RequestContext;

describe('RequestContext', () => {
  beforeEach(setup);
  afterEach(teardown);

  describe('requestedProtocol', () => {
    it('defaults to "http"', async () => {
      await givenRunningAppWithClient();
      await client.get('/products').expect(200);
      expect(observedCtx.requestedProtocol).to.equal('http');
    });

    it('honors "x-forwarded-proto" header', async () => {
      await givenRunningAppWithClient();
      await client
        .get('/products')
        .set('x-forwarded-proto', 'https')
        .expect(200);
      expect(observedCtx.requestedProtocol).to.equal('https');
    });

    it('honors protocol provided by Express request', async () => {
      await givenRunningAppWithClient({protocol: 'https'});
      expect(app.restServer.url).to.startWith('https:');
      // supertest@3 fails with Error: self signed certificate
      // FIXME(bajtos) rework this code once we upgrade to supertest@4
      // await client.get('/products').trustLocalhost().expect(200);
      await httpsGetAsync(app.restServer.url + '/products');
      expect(observedCtx.requestedProtocol).to.equal('https');
    });
  });

  describe('basePath', () => {
    it('defaults to an empty string', async () => {
      await givenRunningAppWithClient();
      await client.get('/products').expect(200);
      expect(observedCtx.basePath).to.equal('');
    });

    it('honors baseUrl when mounted on a sub-path', async () => {
      const lbApp = new RestApplication();
      lbApp.handler(contextObservingHandler);

      const expressApp = express();
      expressApp.use('/api', lbApp.requestHandler);

      await supertest(expressApp)
        .get('/api/products')
        .expect(200);

      expect(observedCtx.basePath).to.equal('/api');
    });

    it('combines both baseUrl and basePath', async () => {
      const lbApp = new RestApplication();
      lbApp.handler(contextObservingHandler);
      lbApp.basePath('/v1'); // set basePath at LoopBack level

      const expressApp = express();
      expressApp.use('/api', lbApp.requestHandler); // mount the app at baseUrl

      await supertest(expressApp)
        .get('/api/v1/products')
        .expect(200);

      expect(observedCtx.basePath).to.equal('/api/v1');
    });
  });

  describe('requestedBaseUrl', () => {
    it('defaults to data from the HTTP connection', async () => {
      await givenRunningAppWithClient({
        host: undefined,
        port: 0,
      });
      const serverUrl = app.restServer.url;

      await client.get('/products').expect(200);

      expect(observedCtx.requestedBaseUrl).to.equal(serverUrl);
    });

    it('honors "x-forwarded-*" headers', async () => {
      await givenRunningAppWithClient();
      await client
        .get('/products')
        .set('x-forwarded-proto', 'https')
        .set('x-forwarded-host', 'example.com')
        .set('x-forwarded-port', '8080')
        .expect(200);
      expect(observedCtx.requestedBaseUrl).to.equal('https://example.com:8080');
    });
  });
});

function setup() {
  (app as unknown) = undefined;
  (client as unknown) = undefined;
  (observedCtx as unknown) = undefined;
}

async function teardown() {
  if (app) await app.stop();
}

async function givenRunningAppWithClient(restOptions?: RestServerConfig) {
  const options: ApplicationConfig = {
    rest: givenHttpServerConfig(restOptions),
  };
  app = new RestApplication(options);
  app.handler(contextObservingHandler);
  await app.start();
  client = createRestAppClient(app);
}

function contextObservingHandler(
  ctx: RequestContext,
  _sequence: DefaultSequence,
) {
  observedCtx = ctx;
  ctx.response.end('ok');
}
