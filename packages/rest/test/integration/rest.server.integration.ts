// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, ApplicationConfig} from '@loopback/core';
import {expect, createClientForHandler} from '@loopback/testlab';
import {Route, RestBindings, RestServer, RestComponent} from '../..';
import * as yaml from 'js-yaml';

describe('RestServer (integration)', () => {
  it('updates rest.port binding when listening on ephemeral port', async () => {
    const server = await givenAServer({rest: {port: 0}});
    await server.start();
    expect(server.getSync(RestBindings.PORT)).to.be.above(0);
    await server.stop();
  });

  it('responds with 500 when Sequence fails with unhandled error', async () => {
    const server = await givenAServer({rest: {port: 0}});
    server.handler((context, sequence) => {
      return Promise.reject(new Error('unhandled test error'));
    });

    // Temporarily disable Mocha's handling of uncaught exceptions
    const mochaListeners = process.listeners('uncaughtException');
    process.removeAllListeners('uncaughtException');
    process.once('uncaughtException', err => {
      expect(err).to.have.property('message', 'unhandled test error');
      for (const l of mochaListeners) {
        process.on('uncaughtException', l);
      }
    });

    return createClientForHandler(server.requestHandler)
      .get('/')
      .expect(500);
  });

  it('allows cors', async () => {
    const server = await givenAServer({rest: {port: 0}});
    server.handler(({response}, sequence) => {
      response.write('Hello');
      response.end();
    });

    await createClientForHandler(server.requestHandler)
      .get('/')
      .expect(200, 'Hello')
      .expect('Access-Control-Allow-Origin', '*')
      .expect('Access-Control-Allow-Credentials', 'true');
  });

  it('allows cors preflight', async () => {
    const server = await givenAServer({rest: {port: 0}});
    server.handler(({response}, sequence) => {
      response.write('Hello');
      response.end();
    });

    await createClientForHandler(server.requestHandler)
      .options('/')
      .expect(204)
      .expect('Access-Control-Allow-Origin', '*')
      .expect('Access-Control-Allow-Credentials', 'true')
      .expect('Access-Control-Max-Age', '86400');
  });

  it('exposes "GET /openapi.json" endpoint', async () => {
    const server = await givenAServer({rest: {port: 0}});
    const greetSpec = {
      responses: {
        200: {
          content: {'text/plain': {schema: {type: 'string'}}},
          description: 'greeting of the day',
        },
      },
    };
    server.route(new Route('get', '/greet', greetSpec, function greet() {}));

    const response = await createClientForHandler(server.requestHandler).get(
      '/openapi.json',
    );
    expect(response.body).to.containDeep({
      openapi: '3.0.0',
      servers: [{url: '/'}],
      info: {title: 'LoopBack Application', version: '1.0.0'},
      paths: {
        '/greet': {
          get: {
            responses: {
              '200': {
                content: {
                  'text/plain': {
                    schema: {type: 'string'},
                  },
                },
                description: 'greeting of the day',
              },
            },
          },
        },
      },
    });
    expect(response.get('Access-Control-Allow-Origin')).to.equal('*');
    expect(response.get('Access-Control-Allow-Credentials')).to.equal('true');
  });

  it('exposes "GET /openapi.yaml" endpoint', async () => {
    const server = await givenAServer({rest: {port: 0}});
    const greetSpec = {
      responses: {
        200: {
          content: {'text/plain': {schema: {type: 'string'}}},
          description: 'greeting of the day',
        },
      },
    };
    server.route(new Route('get', '/greet', greetSpec, function greet() {}));

    const response = await createClientForHandler(server.requestHandler).get(
      '/openapi.yaml',
    );
    const expected = yaml.safeLoad(`
openapi: 3.0.0
info:
  title: LoopBack Application
  version: 1.0.0
paths:
  /greet:
    get:
      responses:
        '200':
          description: greeting of the day
          content:
            'text/plain':
              schema:
                type: string
servers:
  - url: /
    `);
    // Use json for comparison to tolerate textual diffs
    expect(yaml.safeLoad(response.text)).to.eql(expected);
    expect(response.get('Access-Control-Allow-Origin')).to.equal('*');
    expect(response.get('Access-Control-Allow-Credentials')).to.equal('true');
  });

  it('exposes "GET /swagger-ui" endpoint', async () => {
    const app = new Application();
    app.component(RestComponent);
    const server = await app.getServer(RestServer);
    const greetSpec = {
      responses: {
        200: {
          schema: {type: 'string'},
          description: 'greeting of the day',
        },
      },
    };
    server.route(new Route('get', '/greet', greetSpec, function greet() {}));

    const response = await createClientForHandler(server.requestHandler).get(
      '/swagger-ui',
    );
    await server.get(RestBindings.PORT);
    const url = new RegExp(
      [
        'https://loopback.io/api-explorer',
        '\\?url=http://\\d+.\\d+.\\d+.\\d+:\\d+/openapi.json',
      ].join(''),
    );
    expect(response.get('Location')).match(url);
    expect(response.get('Access-Control-Allow-Origin')).to.equal('*');
    expect(response.get('Access-Control-Allow-Credentials')).to.equal('true');
  });

  it('exposes "GET /swagger-ui" endpoint with apiExplorerUrl', async () => {
    const app = new Application({
      rest: {apiExplorerUrl: 'http://petstore.swagger.io'},
    });
    app.component(RestComponent);
    const server = await app.getServer(RestServer);
    const greetSpec = {
      responses: {
        200: {
          schema: {type: 'string'},
          description: 'greeting of the day',
        },
      },
    };
    server.route(new Route('get', '/greet', greetSpec, function greet() {}));

    const response = await createClientForHandler(server.requestHandler).get(
      '/swagger-ui',
    );
    await server.get(RestBindings.PORT);
    const url = new RegExp(
      [
        'http://petstore.swagger.io',
        '\\?url=http://\\d+.\\d+.\\d+.\\d+:\\d+/openapi.json',
      ].join(''),
    );
    expect(response.get('Location')).match(url);
    expect(response.get('Access-Control-Allow-Origin')).to.equal('*');
    expect(response.get('Access-Control-Allow-Credentials')).to.equal('true');
  });

  async function givenAServer(options?: ApplicationConfig) {
    const app = new Application(options);
    app.component(RestComponent);
    return await app.getServer(RestServer);
  }
});
