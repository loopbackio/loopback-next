// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect} from '@loopback/testlab';
import {CoffeeShopsApplication} from '../..';
import {setupApplication} from './test-helper';

describe('CoffeeShop API', () => {
  let app: CoffeeShopsApplication;
  let client: Client;

  before('setupApplication', async function(this: Mocha.Context) {
    this.timeout(30000);
    ({app, client} = await setupApplication());
  });

  after(async () => {
    if (!app) return;
    await app.stop();
  });

  it('provides /api/CoffeeShops/status', async () => {
    const response = await client.get('/api/CoffeeShops/status').expect(200);
    expect(response.body).to.have.property('status');
  });

  it('can query coffee shops', async () => {
    const response = await client.get('/api/CoffeeShops').expect(200);
    expect(response.body).to.have.length(3);
  });
});
