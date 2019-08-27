// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-health
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RestApplication, RestServerConfig} from '@loopback/rest';
import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
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
