// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/mongoose
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, createRestAppClient, expect} from '@loopback/testlab';
import getPort from 'get-port';
import {MongoMemoryServer} from 'mongodb-memory-server';
import {TestMongooseApplication} from './application';
describe('Mongoose Extension', () => {
  let app: TestMongooseApplication;
  let client: Client;

  const userData = {
    firstName: 'TestName',
    lastName: 'TestLastName',
  };
  afterEach(async () => {
    if (app) await app.stop();
    (app as unknown) = undefined;
  });

  beforeEach(async () => {
    const server = new MongoMemoryServer();
    const connectionUrl = await server.getConnectionString();
    const port = await getPort();
    app = new TestMongooseApplication({
      mongoUri: connectionUrl,
      rest: {
        port,
      },
    });
    await app.boot();
    await app.start();
    client = createRestAppClient(app);
  });

  it('Posting to /login should create a single event', async () => {
    const loginRes = await client.post('/login').send(userData);
    expect(loginRes.status).to.eql(204);

    const eventRes = await client.post('/find').send(userData);
    expect(eventRes.status).to.eql(200);
    expect(eventRes.body.length).to.eql(1);
  });
});
