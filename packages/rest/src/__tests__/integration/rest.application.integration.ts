// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {anOperationSpec} from '@loopback/openapi-spec-builder';
import {Client, createRestAppClient, expect} from '@loopback/testlab';
import * as express from 'express';
import {Request, Response} from 'express';
import * as fs from 'fs';
import * as path from 'path';
import {
  get,
  RestApplication,
  RestServer,
  RestServerConfig,
  RouterSpec,
} from '../..';

const ASSETS = path.resolve(__dirname, '../../../fixtures/assets');

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
    restApp.static('/', ASSETS);
    await restApp.start();
    const content = fs
      .readFileSync(path.join(ASSETS, '', 'index.html'))
      .toString('utf-8');
    client = createRestAppClient(restApp);
    await client
      .get('/index.html')
      .expect(200)
      .expect(content);
  });

  it('serves static assets from non-root path', async () => {
    givenApplication();
    restApp.static('/public', ASSETS);
    await restApp.start();
    const content = fs
      .readFileSync(path.join(ASSETS, 'index.html'))
      .toString('utf-8');
    client = createRestAppClient(restApp);
    await client
      .get('/public/index.html')
      .expect(200)
      .expect(content);
  });

  it('returns 404 if asset is not found', async () => {
    givenApplication();
    restApp.static('/', ASSETS);
    await restApp.start();
    client = createRestAppClient(restApp);
    await client.get('/404.html').expect(404);
  });

  it('allows static assets via api after start', async () => {
    givenApplication();
    await restApp.start();
    restApp.static('/', ASSETS);
    const content = fs
      .readFileSync(path.join(ASSETS, 'index.html'))
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

  it('honors basePath for static assets', async () => {
    givenApplication();
    restApp.basePath('/html');
    restApp.static('/', ASSETS);
    await restApp.start();
    client = createRestAppClient(restApp);
    await client.get('/html/index.html').expect(200);
  });

  it('honors basePath for routes', async () => {
    givenApplication();
    restApp.basePath('/api');
    restApp.route('get', '/status', anOperationSpec().build(), () => ({
      running: true,
    }));

    await restApp.start();
    client = createRestAppClient(restApp);
    await client.get('/api/status').expect(200, {running: true});
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

  it('creates a redirect route with a custom status code', async () => {
    givenApplication();

    class PingController {
      @get('/ping')
      ping(): string {
        return 'Hi';
      }
    }
    restApp.controller(PingController);

    restApp.redirect('/custom/ping', '/ping', 307);
    await restApp.start();
    client = createRestAppClient(restApp);
    const response = await client.get('/custom/ping').expect(307);
    await client.get(response.header.location).expect(200, 'Hi');
  });

  context('mounting an Express router on a LoopBack application', () => {
    beforeEach('set up RestApplication', async () => {
      givenApplication();
      await restApp.start();
      client = createRestAppClient(restApp);
    });

    it('gives precedence to an external route over a static route', async () => {
      const router = express.Router();
      router.get('/', function(_req: Request, res: Response) {
        res.send('External dog');
      });

      restApp.static('/dogs', ASSETS);
      restApp.mountExpressRouter('/dogs', router);

      await client.get('/dogs/').expect(200, 'External dog');
    });

    it('mounts an express Router without spec', async () => {
      const router = express.Router();
      router.get('/poodle/', function(_req: Request, res: Response) {
        res.send('Poodle!');
      });
      router.get('/pug', function(_req: Request, res: Response) {
        res.send('Pug!');
      });
      restApp.mountExpressRouter('/dogs', router);

      await client.get('/dogs/poodle/').expect(200, 'Poodle!');
      await client.get('/dogs/pug').expect(200, 'Pug!');
    });

    it('mounts an express Router with spec', async () => {
      const router = express.Router();
      function greetDogs(_req: Request, res: Response) {
        res.send('Hello dogs!');
      }

      const spec: RouterSpec = {
        paths: {
          '/hello': {
            get: {
              responses: {
                '200': {
                  description: 'greet the dogs',
                  content: {
                    'text/plain': {
                      schema: {type: 'string'},
                    },
                  },
                },
              },
            },
          },
        },
      };
      router.get('/hello', greetDogs);
      restApp.mountExpressRouter('/dogs', router, spec);
      await client.get('/dogs/hello').expect(200, 'Hello dogs!');

      const openApiSpec = restApp.restServer.getApiSpec();
      expect(openApiSpec.paths).to.deepEqual({
        '/dogs/hello': {
          get: {
            responses: {
              '200': {
                description: 'greet the dogs',
                content: {'text/plain': {schema: {type: 'string'}}},
              },
            },
          },
        },
      });
    });

    it('mounts more than one express Router', async () => {
      const router = express.Router();
      router.get('/poodle', function(_req: Request, res: Response) {
        res.send('Poodle!');
      });

      restApp.mountExpressRouter('/dogs', router);

      const secondRouter = express.Router();

      secondRouter.get('/persian', function(_req: Request, res: Response) {
        res.send('Persian cat.');
      });

      restApp.mountExpressRouter('/cats', secondRouter);

      await client.get('/dogs/poodle').expect(200, 'Poodle!');
      await client.get('/cats/persian').expect(200, 'Persian cat.');
    });
  });

  it('mounts Express Router on top of rest basePath', async () => {
    givenApplication();

    const router = express.Router();
    router.get('/poodle', function(_req: Request, res: Response) {
      res.send('Poodle!');
    });
    restApp.mountExpressRouter('/dogs', router);

    restApp.basePath('/api');
    await restApp.start();
    client = createRestAppClient(restApp);

    await client.get('/api/dogs/poodle').expect(200, 'Poodle!');
  });

  function givenApplication(options?: {rest: RestServerConfig}) {
    options = options || {rest: {port: 0, host: '127.0.0.1'}};
    restApp = new RestApplication(options);
  }
});
