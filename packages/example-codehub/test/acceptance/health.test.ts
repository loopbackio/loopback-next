// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, supertest as request} from 'testlab';
import * as util from 'example-codehub/test/support/util';

describe.only('health', () => {
  let app;
  let client;
  before(createClient);
  before(createApp);

  it('returns the uptime', async () => {
    const response = await client
      .get('/health')
      // .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body.uptime).to.be.a('number');
  });

  function createClient() {
    client = util.createClient('http', 3000);
  }
  function createApp() {
   app = util.createApp();
   return app.start();
  }
});
