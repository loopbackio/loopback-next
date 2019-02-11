// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client} from '@loopback/testlab';
import {CoffeeShopsApplication} from '../..';
import {setupApplication} from './test-helper';

describe('HomePage', () => {
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

  it('exposes a default home page', async () => {
    await client
      .get('/')
      .expect(200)
      .expect('Content-Type', /text\/html/);
  });

  it('exposes self-hosted explorer', async () => {
    await client
      .get('/explorer/')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/<title>LoopBack API Explorer/);
  });
});
