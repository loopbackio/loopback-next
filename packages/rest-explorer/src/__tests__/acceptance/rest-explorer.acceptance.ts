// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RestApplication, RestServerConfig} from '@loopback/rest';
import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {
  RestExplorerBindings,
  RestExplorerComponent,
  RestExplorerConfig,
} from '../..';

describe('API Explorer (acceptance)', () => {
  let app: RestApplication;
  let request: Client;

  afterEach(async () => {
    if (app) await app.stop();
    (app as unknown) = undefined;
  });

  context('with default config', () => {
    beforeEach(async () => {
      app = givenRestApplication();
      app.component(RestExplorerComponent);
      await app.start();
      request = createRestAppClient(app);
    });

    it('exposes API Explorer at "/explorer/"', async () => {
      await request
        .get('/explorer/')
        .expect(200)
        .expect('content-type', /html/)
        .expect(/<title>LoopBack API Explorer/);
    });

    it('redirects from "/explorer" to "/explorer/"', async () => {
      await request
        .get('/explorer')
        .expect(301)
        // expect relative redirect so that it works seamlessly with many forms
        // of base path, whether within the app or applied by a reverse proxy
        .expect('location', './explorer/');
    });

    it('configures swagger-ui with OpenAPI spec url "./openapi.json', async () => {
      const response = await request.get('/explorer/').expect(200);
      const body = response.body;
      expect(body).to.match(/^\s*url: '\.\/openapi.json',\s*$/m);
    });

    it('hosts OpenAPI at "./openapi.json', async () => {
      await request.get('/explorer/openapi.json').expect(200);
    });

    it('mounts swagger-ui assets at "/explorer"', async () => {
      await request.get('/explorer/swagger-ui-bundle.js').expect(200);
      await request.get('/explorer/swagger-ui.css').expect(200);
    });
  });

  context('with custom RestServerConfig', () => {
    it('uses self-hosted spec by default', async () => {
      await givenAppWithCustomExplorerConfig({
        openApiSpec: {
          endpointMapping: {
            '/apispec': {format: 'json', version: '3.0.0'},
            '/apispec/v2': {format: 'json', version: '2.0.0'},
            '/apispec/yaml': {format: 'yaml', version: '3.0.0'},
          },
        },
      });

      const response = await request.get('/explorer/').expect(200);
      const body = response.body;
      expect(body).to.match(/^\s*url: '\.\/openapi.json',\s*$/m);
    });

    it('honors flag to disable self-hosted spec', async () => {
      await givenAppWithCustomExplorerConfig(
        {
          openApiSpec: {
            endpointMapping: {
              '/apispec': {format: 'json', version: '3.0.0'},
              '/apispec/v2': {format: 'json', version: '2.0.0'},
              '/apispec/yaml': {format: 'yaml', version: '3.0.0'},
            },
          },
        },
        {
          useSelfHostedSpec: false,
        },
      );

      const response = await request.get('/explorer/').expect(200);
      const body = response.body;
      expect(body).to.match(/^\s*url: '\/apispec',\s*$/m);
    });
  });

  context('with custom RestExplorerConfig', () => {
    it('honors custom explorer path', async () => {
      await givenAppWithCustomExplorerConfig(undefined, {
        path: '/openapi/ui',
      });

      await request
        .get('/openapi/ui/')
        .expect(200, /<title>LoopBack API Explorer/);

      await request
        .get('/openapi/ui')
        .expect(301)
        // expect relative redirect so that it works seamlessly with many forms
        // of base path, whether within the app or applied by a reverse proxy
        .expect('Location', './ui/');

      await request.get('/explorer').expect(404);
    });

    it('honors flag to disable self-hosted spec', async () => {
      await givenAppWithCustomExplorerConfig(undefined, {
        path: '/openapi/ui',
        useSelfHostedSpec: false,
      });

      const response = await request.get('/openapi/ui/').expect(200);
      const body = response.body;
      expect(body).to.match(/<title>LoopBack API Explorer/);
      expect(body).to.match(/^\s*url: '\/openapi.json',\s*$/m);

      await request
        .get('/openapi/ui')
        .expect(301)
        // expect relative redirect so that it works seamlessly with many forms
        // of base path, whether within the app or applied by a reverse proxy
        .expect('Location', './ui/');

      await request.get('/explorer').expect(404);
      await request.get('/explorer/openapi.json').expect(404);
      await request.get('/openapi/ui/openapi.json').expect(404);
    });
  });

  context('with custom basePath', () => {
    beforeEach(async () => {
      app = givenRestApplication();
      app.basePath('/api');
      app.component(RestExplorerComponent);
      await app.start();
      request = createRestAppClient(app);
    });

    it('uses correct URLs', async () => {
      // static assets (including swagger-ui) honor basePath
      await request
        .get('/api/explorer/')
        .expect(200)
        .expect('content-type', /html/)
        // OpenAPI endpoints DO NOT honor basePath
        .expect(/url\: '\.\/openapi\.json'\,/);
    });
  });

  function givenRestApplication(config?: RestServerConfig) {
    const rest = Object.assign({}, givenHttpServerConfig(), config);
    return new RestApplication({rest});
  }

  async function givenAppWithCustomExplorerConfig(
    config?: RestServerConfig,
    explorerConfig?: RestExplorerConfig,
  ) {
    app = givenRestApplication(config);
    if (explorerConfig) {
      app.bind(RestExplorerBindings.CONFIG).to(explorerConfig);
    }
    app.component(RestExplorerComponent);
    await app.start();
    request = createRestAppClient(app);
  }
});
