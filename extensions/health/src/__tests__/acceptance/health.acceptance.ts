// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/health
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RestApplication, RestServer, RestServerConfig} from '@loopback/rest';
import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
  validateApiSpec,
} from '@loopback/testlab';
import {HealthComponent} from '../..';
import {HealthBindings, HealthTags} from '../../keys';
import {HealthConfig, LiveCheck, ReadyCheck} from '../../types';

describe('Health (acceptance)', () => {
  let app: RestApplication;
  let request: Client;

  afterEach(async () => {
    if (app) await app.stop();
    (app as unknown) = undefined;
  });

  context('with default config', () => {
    beforeEach(async () => {
      app = givenRestApplication();
      app.component(HealthComponent);
      await app.start();
      request = createRestAppClient(app);
    });

    it('exposes health at "/health/"', async () => {
      await request.get('/health').expect(200, {status: 'UP', checks: []});
    });

    it('exposes health at "/ready/"', async () => {
      await request.get('/ready').expect(200, {status: 'UP', checks: []});
    });

    it('exposes health at "/live/"', async () => {
      await request.get('/live').expect(200, {status: 'UP', checks: []});
    });

    it('removes listener from the process', async () => {
      const healthChecker = await app.get(HealthBindings.HEALTH_CHECKER);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const onShutdownRequest = (healthChecker as any).onShutdownRequest;
      let listeners = process.listeners('SIGTERM');
      expect(listeners).to.containEql(onShutdownRequest);
      await app.stop();
      listeners = process.listeners('SIGTERM');
      expect(listeners).to.not.containEql(onShutdownRequest);
    });

    it('hides the endpoints from the openapi spec', async () => {
      const server = await app.getServer(RestServer);
      const spec = await server.getApiSpec();
      expect(spec.paths).to.be.empty();
      await validateApiSpec(spec);
    });
  });

  context('with discovered live/ready checks', () => {
    beforeEach(async () => {
      app = givenRestApplication();
      app.component(HealthComponent);
      app
        .bind<LiveCheck>('health.MockLiveCheck')
        .to(() => Promise.resolve())
        .tag(HealthTags.LIVE_CHECK);

      app
        .bind<ReadyCheck>('health.MockReadyCheck')
        .to(() => Promise.resolve())
        .tag(HealthTags.READY_CHECK);

      await app.start();
      request = createRestAppClient(app);
    });

    it('exposes health at "/health/"', async () => {
      await request.get('/health').expect(200, {
        status: 'UP',
        checks: [
          {
            name: 'health.MockReadyCheck',
            state: 'UP',
            data: {
              reason: '',
            },
          },
          {
            name: 'health.MockLiveCheck',
            state: 'UP',
            data: {
              reason: '',
            },
          },
        ],
      });
    });

    it('exposes health at "/ready/"', async () => {
      await request.get('/ready').expect(200, {
        status: 'UP',
        checks: [
          {
            name: 'health.MockReadyCheck',
            state: 'UP',
            data: {
              reason: '',
            },
          },
        ],
      });
    });

    it('exposes health at "/live/"', async () => {
      await request.get('/live').expect(200, {
        status: 'UP',
        checks: [
          {
            name: 'health.MockLiveCheck',
            state: 'UP',
            data: {
              reason: '',
            },
          },
        ],
      });
    });
  });

  context('with discovered live/ready checks that fail', () => {
    beforeEach(async () => {
      app = givenRestApplication();
      app.component(HealthComponent);
      app
        .bind<LiveCheck>('health.MockLiveCheck')
        .to(() => Promise.reject())
        .tag(HealthTags.LIVE_CHECK);

      app
        .bind<ReadyCheck>('health.MockReadyCheck')
        .to(() => Promise.reject())
        .tag(HealthTags.READY_CHECK);

      await app.start();
      request = createRestAppClient(app);
    });

    it('exposes health at "/health/"', async () => {
      await request.get('/health').expect(503, {
        status: 'DOWN',
        checks: [
          {
            name: 'health.MockReadyCheck',
            state: 'DOWN',
            data: {
              reason: '',
            },
          },
          {
            name: 'health.MockLiveCheck',
            state: 'DOWN',
            data: {
              reason: '',
            },
          },
        ],
      });
    });

    it('exposes health at "/ready/"', async () => {
      await request.get('/ready').expect(503, {
        status: 'DOWN',
        checks: [
          {
            name: 'health.MockReadyCheck',
            state: 'DOWN',
            data: {
              reason: '',
            },
          },
        ],
      });
    });

    it('exposes health at "/live/"', async () => {
      await request.get('/live').expect(500, {
        status: 'DOWN',
        checks: [
          {
            name: 'health.MockLiveCheck',
            state: 'DOWN',
            data: {
              reason: '',
            },
          },
        ],
      });
    });
  });

  context('with custom endpoint basePath', () => {
    it('honors prefix', async () => {
      await givenAppWithCustomConfig({
        healthPath: '/internal/health',
      });
      await request
        .get('/internal/health')
        .expect(200, {status: 'UP', checks: []});
      await request.get('/health').expect(404);
    });
  });

  context('with defaultHealth disabled', () => {
    it('does not expose /health', async () => {
      await givenAppWithCustomConfig({
        disabled: true,
      });
      await request.get('/health').expect(404);
    });
  });

  context('with openApiSpec enabled', () => {
    beforeEach(async () => {
      await givenAppWithCustomConfig({
        openApiSpec: true,
      });
    });

    it('adds the endpoints to the openapi spec', async () => {
      const server = await app.getServer(RestServer);
      const spec = await server.getApiSpec();
      expect(spec.paths).to.have.properties('/health', '/live', '/ready');
      await validateApiSpec(spec);
    });
  });

  async function givenAppWithCustomConfig(config: HealthConfig) {
    app = givenRestApplication();
    app.bind(HealthBindings.CONFIG).to(config);
    app.component(HealthComponent);
    await app.start();
    request = createRestAppClient(app);
  }

  function givenRestApplication(config?: RestServerConfig) {
    const rest = Object.assign({}, givenHttpServerConfig(), config);
    return new RestApplication({rest});
  }
});
