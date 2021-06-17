// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/metrics
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CoreBindings} from '@loopback/core';
import {RestApplication, RestServerConfig} from '@loopback/rest';
import {expect, givenHttpServerConfig, supertest} from '@loopback/testlab';
import {AddressInfo} from 'net';
import {promisify} from 'util';
import {MetricsBindings, MetricsComponent, MetricsOptions} from '../..';
import {MetricsPushObserver} from '../../observers';
import {PushGateway} from './mock-pushgateway';

const gateway = new PushGateway();

describe('Metrics (with push gateway)', function () {
  let gwUrl: string;
  before(async () => {
    const server = await gateway.start(0);
    const port = (server.address() as AddressInfo).port;
    gwUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    return gateway.stop();
  });

  let app: RestApplication;

  afterEach(async () => {
    if (app) await app.stop();
    (app as unknown) = undefined;
    await promisify(setTimeout)(10);
    gateway.reset();
  });

  it('pushes metrics to gateway', async () => {
    await givenAppWithCustomConfig({
      // Push metrics each 10 ms
      pushGateway: {url: gwUrl, interval: 10},
    });

    // Wait for 50 ms
    await promisify(setTimeout)(50);
    const request = supertest(gwUrl);
    // Now we expect to get LoopBack metrics from the push gateway
    await request.get('/metrics').expect(200, /job="loopback"/);
    expect(gateway.puts).to.equal(0);
    expect(gateway.posts).to.be.greaterThanOrEqual(1);
  });

  it('pushes metrics to gateway with grouping key', async () => {
    await givenAppWithCustomConfig({
      pushGateway: {
        url: gwUrl,
        interval: 10,
        jobName: 'my_job',
        groupingKey: {env: 'test'},
      },
    });

    await promisify(setTimeout)(50);
    const request = supertest(gwUrl);
    await request.get('/metrics').expect(200, /job="my_job",env="test"/);
    expect(gateway.puts).to.equal(0);
    expect(gateway.posts).to.be.greaterThanOrEqual(1);
  });

  it('pushes metrics to gateway with replacement', async () => {
    await givenAppWithCustomConfig({
      pushGateway: {
        url: gwUrl,
        interval: 10,
        jobName: 'my_other_job',
        groupingKey: {env: 'poc'},
        replaceAll: true,
      },
    });

    await promisify(setTimeout)(50);
    const request = supertest(gwUrl);
    await request.get('/metrics').expect(200, /job="my_other_job",env="poc"/);
    expect(gateway.puts).to.be.greaterThanOrEqual(1);
    expect(gateway.posts).to.equal(0);
  });

  it('adds MetricsPushObserver to the application', async () => {
    await givenAppWithCustomConfig({
      pushGateway: {url: gwUrl},
    });

    expect(
      app.isBound(
        `${CoreBindings.LIFE_CYCLE_OBSERVERS}.${MetricsPushObserver.name}`,
      ),
    ).to.be.true();
  });

  async function givenAppWithCustomConfig(config: MetricsOptions) {
    app = givenRestApplication();
    app.configure(MetricsBindings.COMPONENT).to(config);
    app.component(MetricsComponent);
    await app.start();
  }

  function givenRestApplication(config?: RestServerConfig) {
    const rest = Object.assign({}, givenHttpServerConfig(), config);
    return new RestApplication({rest});
  }
});
