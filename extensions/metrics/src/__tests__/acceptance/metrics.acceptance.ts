// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/metrics
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CoreBindings, GLOBAL_INTERCEPTOR_NAMESPACE} from '@loopback/core';
import {RestApplication, RestServer, RestServerConfig} from '@loopback/rest';
import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
  validateApiSpec,
} from '@loopback/testlab';
import {MetricsBindings, MetricsComponent, MetricsOptions} from '../..';
import {metricsControllerFactory} from '../../controllers';
import {MetricsInterceptor} from '../../interceptors';
import {MetricsObserver, MetricsPushObserver} from '../../observers';

describe('Metrics (acceptance)', () => {
  let app: RestApplication;
  let request: Client;

  afterEach(async () => {
    if (app) await app.stop();
    (app as unknown) = undefined;
  });

  context('with default config', () => {
    beforeEach(async () => {
      app = givenRestApplication();
      app.component(MetricsComponent);
      await app.start();
      request = createRestAppClient(app);
    });

    it('exposes metrics at "/metrics/"', async () => {
      const res = await request
        .get('/metrics')
        .expect(200)
        .expect('content-type', /text/);
      expect(res.text).to.match(/# TYPE/);
      expect(res.text).to.match(/# HELP/);
    });

    it('hides the metrics endpoints from the openapi spec', async () => {
      const server = await app.getServer(RestServer);
      const spec = await server.getApiSpec();
      expect(spec.paths).to.be.empty();
      await validateApiSpec(spec);
    });

    it('adds MetricsObserver, MetricsInterceptor and MetricsController to the application', () => {
      expect(
        app.isBound(
          `${CoreBindings.LIFE_CYCLE_OBSERVERS}.${MetricsObserver.name}`,
        ),
      ).to.be.true();
      expect(
        app.isBound(
          `${GLOBAL_INTERCEPTOR_NAMESPACE}.${MetricsInterceptor.name}`,
        ),
      ).to.be.true();
      expect(
        app.isBound(
          `${CoreBindings.CONTROLLERS}.${metricsControllerFactory().name}`,
        ),
      ).to.be.true();
    });

    it('does not add MetricsPushObserver to the application', () => {
      expect(
        app.isBound(
          `${CoreBindings.LIFE_CYCLE_OBSERVERS}.${MetricsPushObserver.name}`,
        ),
      ).to.be.false();
    });
  });

  context('with custom defaultMetrics', () => {
    it('honors prefix', async () => {
      await givenAppWithCustomConfig({
        defaultMetrics: {
          // `-` is not allowed
          prefix: 'myapp_',
        },
      });
      await request.get('/metrics').expect(200).expect('content-type', /text/);
    });
  });

  context('with custom endpoint basePath', () => {
    it('honors prefix', async () => {
      await givenAppWithCustomConfig({
        endpoint: {
          basePath: '/internal/metrics',
        },
      });
      await request
        .get('/internal/metrics')
        .expect(200)
        .expect('content-type', /text/);
      await request.get('/metrics').expect(404);
    });
  });

  context('with endpoint disabled', () => {
    beforeEach(async () => {
      await givenAppWithCustomConfig({
        endpoint: {
          disabled: true,
        },
      });
    });

    it('does not expose /metrics', async () => {
      await request.get('/metrics').expect(404);
    });

    it('does not add MetricsController to the application', () => {
      expect(
        app.isBound(
          `${CoreBindings.CONTROLLERS}.${metricsControllerFactory().name}`,
        ),
      ).to.be.false();
    });
  });

  context('with defaultMetrics disabled', () => {
    beforeEach(async () => {
      await givenAppWithCustomConfig({
        defaultMetrics: {
          disabled: true,
        },
      });
    });

    it('does not emit default metrics', async () => {
      const res = await request
        .get('/metrics')
        .expect(200)
        .expect('content-type', /text/);
      expect(res.text).to.not.match(
        /# TYPE process_cpu_user_seconds_total counter/,
      );
    });

    it('does not add MetricsObserver to the application', () => {
      expect(
        app.isBound(
          `${CoreBindings.LIFE_CYCLE_OBSERVERS}.${MetricsObserver.name}`,
        ),
      ).to.be.false();
    });
  });

  context('with openApiSpec enabled', () => {
    beforeEach(async () => {
      await givenAppWithCustomConfig({
        openApiSpec: true,
      });
    });

    it('adds the metrics endpoint to the openapi spec', async () => {
      const server = await app.getServer(RestServer);
      const spec = await server.getApiSpec();
      expect(spec.paths).to.have.properties('/metrics');
      await validateApiSpec(spec);
    });
  });

  async function givenAppWithCustomConfig(config: MetricsOptions) {
    app = givenRestApplication();
    app.configure(MetricsBindings.COMPONENT).to(config);
    app.component(MetricsComponent);
    await app.start();
    request = createRestAppClient(app);
  }

  function givenRestApplication(config?: RestServerConfig) {
    const rest = Object.assign({}, givenHttpServerConfig(), config);
    return new RestApplication({rest});
  }
});
