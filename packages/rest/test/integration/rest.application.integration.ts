// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {createRestAppClient, Client, expect} from '@loopback/testlab';
import {RestApplication} from '../..';
import * as path from 'path';
import * as fs from 'fs';
import {RestServer, RestServerConfig} from '../../src';

const FIXTURES = path.resolve(__dirname, '../../../fixtures');

describe('RestApplication (integration)', () => {
  let restApp: RestApplication;
  let client: Client;

  afterEach(async () => {
    if (restApp.restServer.listening) {
      await restApp.stop();
    }
  });

  it('serves static assets from root path', async () => {
    givenApplication();
    restApp.static('/', FIXTURES);
    await restApp.start();
    const content = fs
      .readFileSync(path.join(FIXTURES, 'index.html'))
      .toString('utf-8');
    client = createRestAppClient(restApp);
    await client
      .get('/index.html')
      .expect(200)
      .expect(content);
  });

  it('serves static assets from non-root path', async () => {
    givenApplication();
    restApp.static('/public', FIXTURES);
    await restApp.start();
    const content = fs
      .readFileSync(path.join(FIXTURES, 'index.html'))
      .toString('utf-8');
    client = createRestAppClient(restApp);
    await client
      .get('/public/index.html')
      .expect(200)
      .expect(content);
  });

  it('returns 404 if asset is not found', async () => {
    givenApplication();
    restApp.static('/', FIXTURES);
    await restApp.start();
    client = createRestAppClient(restApp);
    await client.get('/404.html').expect(404);
  });

  it('allows static assets via api after start', async () => {
    givenApplication();
    await restApp.start();
    restApp.static('/', FIXTURES);
    const content = fs
      .readFileSync(path.join(FIXTURES, 'index.html'))
      .toString('utf-8');
    client = createRestAppClient(restApp);
    await client
      .get('/index.html')
      .expect(200)
      .expect(content);
  });

  it('adds new route', async () => {
    givenApplication();
    const greetSpec = {
      responses: {
        200: {
          schema: {type: 'string'},
          description: 'Hello',
        },
      },
    };
    restApp.route('get', '/greet', greetSpec, function greet() {
      return 'Hello';
    });
    await restApp.start();
    client = createRestAppClient(restApp);
    await client
      .get('/greet')
      .expect(200)
      .expect('Hello');
  });

  it('returns RestServer instance', async () => {
    givenApplication();
    const restServer = restApp.restServer;
    expect(restServer).to.be.instanceOf(RestServer);
  });

  it('sets OpenAPI specification', async () => {
    givenApplication();
    restApp.api({
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      servers: [{url: 'example.com:8080/api'}],
      paths: {},
      'x-foo': 'bar',
    });

    const spec = restApp.restServer.getApiSpec();
    expect(spec).to.deepEqual({
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      servers: [{url: 'example.com:8080/api'}],
      paths: {},
      'x-foo': 'bar',
    });
  });

  function givenApplication(options?: {rest: RestServerConfig}) {
    options = options || {rest: {port: 0, host: '127.0.0.1'}};
    restApp = new RestApplication(options);
  }
});
