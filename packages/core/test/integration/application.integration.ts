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

  it('exposes "GET /openapi.json" endpoint', async () => {
    const app = new Application({http: {port: 0}});
    const greetSpec = {
      responses: {
        200: {
          type: 'string',
          description: 'greeting of the day',
        },
      },
    };
    app.route(new Route('get', '/greet', greetSpec, function greet() {}));

    const response = await createClientForApp(app).get('/openapi.json');
    expect(response.body).to.containDeep({
      basePath: '/',
      paths: {
        '/greet': {
          get: greetSpec,
        },
      },
    });
  });
});
