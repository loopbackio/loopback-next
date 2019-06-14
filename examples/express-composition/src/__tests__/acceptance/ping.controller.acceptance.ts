// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-express-composition
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect} from '@loopback/testlab';
import {ExpressServer} from '../../server';
import {setupExpressApplication} from './test-helper';

describe('PingController', () => {
  let server: ExpressServer;
  let client: Client;

  before(async function givenApplication() {
    ({server, client} = await setupExpressApplication());
  });

  after(async function closeApplication() {
    await server.stop();
  });

  it('invokes GET /ping', async () => {
    const res = await client.get('/api/ping?msg=world').expect(200);
    expect(res.body).to.containEql({greeting: 'Hello from LoopBack'});
  });
});
