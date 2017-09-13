// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, createClientForApp} from '@loopback/testlab';
import {
  Application,
  Route,
  ResponseObject,
  SchemaObject,
  ReferenceObject,
  CoreBindings,
} from '../..';
import {Context} from '@loopback/context';

describe('Application (integration)', () => {
  it('updates http.port binding when listening on ephemeral port', async () => {
    const app = new Application({http: {port: 0}});
    await app.start();
    expect(app.getSync(CoreBindings.HTTP_PORT)).to.be.above(0);
  });

  it('responds with 500 when Sequence fails with unhandled error', () => {
    const app = new Application({http: {port: 0}});
    app.handler((sequence, request, response) => {
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

    return createClientForApp(app).get('/').expect(500);
  });

  it('exposes "GET /swagger.json" endpoint', async () => {
    const app = new Application({http: {port: 0}});
    const greetSpec = {
      responses: {
        200: {
          schema: { type: 'string' },
          description: 'greeting of the day',
        },
      },
    };
    app.route(new Route('get', '/greet', greetSpec, function greet() {}));

    const response = await createClientForApp(app).get('/swagger.json');
    expect(response.body).to.containDeep({
      basePath: '/',
      paths: {
        '/greet': {
          get: greetSpec,
        },
      },
    });
    expect(response.get('Access-Control-Allow-Origin')).to.equal('*');
    expect(response.get('Access-Control-Allow-Credentials')).to.equal('true');
    expect(response.get('Access-Control-Allow-Max-Age')).to.equal('86400');
  });

  it('exposes "GET /swagger.yaml" endpoint', async () => {
    const app = new Application({http: {port: 0}});
    const greetSpec = {
      responses: {
        200: {
          schema: { type: 'string' },
          description: 'greeting of the day',
        },
      },
    };
    app.route(new Route('get', '/greet', greetSpec, function greet() {}));

    const response = await createClientForApp(app).get('/swagger.yaml');
    expect(response.text).to.eql(`swagger: '2.0'
basePath: /
info:
  title: LoopBack Application
  version: 1.0.0
paths:
  /greet:
    get:
      responses:
        '200':
          schema:
            type: string
          description: greeting of the day
`);
    expect(response.get('Access-Control-Allow-Origin')).to.equal('*');
    expect(response.get('Access-Control-Allow-Credentials')).to.equal('true');
    expect(response.get('Access-Control-Allow-Max-Age')).to.equal('86400');
  });

  it('exposes "GET /openapi.json" endpoint', async () => {
    const app = new Application({http: {port: 0}});
    const greetSpec = {
      responses: {
        200: {
          schema: { type: 'string' },
          description: 'greeting of the day',
        },
      },
    };
    app.route(new Route('get', '/greet', greetSpec, function greet() {}));

    const response = await createClientForApp(app).get('/openapi.json');
    expect(response.body).to.containDeep({
      openapi: '3.0.0',
      servers: [ { url: '/' } ],
      info: { title: 'LoopBack Application', version: '1.0.0' },
      paths: {
        '/greet': {
          get: {
            responses: {
              '200': {
                content: {
                  '*/*': {
                    schema: { type: 'string' },
                  },
                },
                description: 'greeting of the day',
              },
            },
          },
        },
      },
      components: { schemas:  {} },
    });
    expect(response.get('Access-Control-Allow-Origin')).to.equal('*');
    expect(response.get('Access-Control-Allow-Credentials')).to.equal('true');
    expect(response.get('Access-Control-Allow-Max-Age')).to.equal('86400');
  });

  it('exposes "GET /openapi.yaml" endpoint', async () => {
    const app = new Application({http: {port: 0}});
    const greetSpec = {
      responses: {
        200: {
          schema: { type: 'string' },
          description: 'greeting of the day',
        },
      },
    };
    app.route(new Route('get', '/greet', greetSpec, function greet() {}));

    const response = await createClientForApp(app).get('/openapi.yaml');
    expect(response.text).to.eql(`openapi: 3.0.0
servers:
  - url: /
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
            '*/*':
              schema:
                type: string
components:
  schemas: {}
`);
    expect(response.get('Access-Control-Allow-Origin')).to.equal('*');
    expect(response.get('Access-Control-Allow-Credentials')).to.equal('true');
    expect(response.get('Access-Control-Allow-Max-Age')).to.equal('86400');
  });
  it('exposes "GET /swagger-ui" endpoint', async () => {
    const app = new Application({http: {port: 0}});
    const greetSpec = {
      responses: {
        200: {
          schema: { type: 'string' },
          description: 'greeting of the day',
        },
      },
    };
    app.route(new Route('get', '/greet', greetSpec, function greet() {}));

    const response = await createClientForApp(app).get('/swagger-ui');
    const port = await app.get('http.port');
    const url = new RegExp(['http:\/\/petstore.swagger.io',
      '\/\\?url=http:\/\/\\d+\.\\d+\.\\d+\.\\d+\:\\d+\/swagger.json'].join(''));
    expect(response.get('Location')).match(url);
    expect(response.get('Access-Control-Allow-Origin')).to.equal('*');
    expect(response.get('Access-Control-Allow-Credentials')).to.equal('true');
    expect(response.get('Access-Control-Allow-Max-Age')).to.equal('86400');
  });

});
