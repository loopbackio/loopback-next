// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-lb3-application
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client} from '@loopback/testlab';
import {CoffeeShopApplication} from '../../application';
import {setupApplication} from './test-helper';

describe('HomePage', () => {
  let app: CoffeeShopApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
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

  it('exposes LoopBack 3 home page', async () => {
    await client
      .get('/lb3-index.html')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/<h1>LoopBack Rocks!/);
  });
});
