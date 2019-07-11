// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-metrics
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RestApplication, RestServerConfig} from '@loopback/rest';
import {givenHttpServerConfig, supertest} from '@loopback/testlab';
import {AddressInfo} from 'net';
import {promisify} from 'util';
import {MetricsBindings, MetricsComponent, MetricsOptions} from '../..';
import {PushGateway} from './mock-pushgateway';

const gateway = new PushGateway();

describe('Metrics (with push gateway)', function() {
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
  });

  beforeEach(async () => {
    await givenAppWithCustomConfig({
      // Push metrics each 10 ms
      pushGateway: {url: gwUrl, interval: 10},
    });
  });

  it('pushes metrics to gateway', async () => {
    // Wait for 100 ms
    await promisify(setTimeout)(50);
    const request = supertest(gwUrl);
    // Now we expect to get LoopBack metrics from the push gateway
    await request.get('/metrics').expect(200, /job="loopback"/);
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
