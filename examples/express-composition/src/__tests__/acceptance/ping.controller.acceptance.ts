// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-express-composition
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect} from '@loopback/testlab';
import {setupExpressApplication} from './test-helper';
import {ExpressServer} from '../../server';

describe('PingController', () => {
  let server: ExpressServer;
  let client: Client;

  before('setupApplication', async () => {
    ({server, client} = await setupExpressApplication());
  });

  after('closes application', async () => {
    await server.stop();
  });

  it('invokes GET /ping', async () => {
    const res = await client.get('/api/ping?msg=world').expect(200);
    expect(res.body).to.containEql({greeting: 'Hello from LoopBack'});
  });
});
