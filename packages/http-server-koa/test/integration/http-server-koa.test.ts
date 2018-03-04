// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {supertest} from '@loopback/testlab';

import * as fs from 'fs';
import * as path from 'path';

import {HTTP_FACTORY, HttpServerConfig, HttpHandler, HttpEndpoint} from '../..';

describe('http-server-koa (integration)', () => {
  const factory = HTTP_FACTORY;
  let endpoint: HttpEndpoint;

  afterEach(() => endpoint.stop());

  it('supports http protocol', async () => {
    endpoint = givenEndpoint({port: 0}, async httpCtx => {
      httpCtx.response.body = 'Hello';
    });

    await endpoint.start();

    await supertest(endpoint.url)
      .get('/')
      .expect(200, 'Hello');
  });

  it('supports https protocol', async () => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const key = fs.readFileSync(
      path.join(__dirname, '../../../test/integration/privatekey.pem'),
    );
    const cert = fs.readFileSync(
      path.join(__dirname, '../../../test/integration/certificate.pem'),
    );
    endpoint = givenEndpoint(
      {protocol: 'https', httpsServerOptions: {cert, key}, port: 0},
      async httpCtx => {
        httpCtx.response.body = 'Hello';
      },
    );

    await endpoint.start();

    await supertest(endpoint.url)
      .get('/')
      .expect(200, 'Hello');
    delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  });

  function givenEndpoint(options: HttpServerConfig, handler: HttpHandler) {
    return factory.createEndpoint(options || {}, handler);
  }
});
