// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-lb3-application
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, givenHttpServerConfig, supertest} from '@loopback/testlab';
import {ExpressServer} from '../../server';
const lb3app = require('../../../lb3app/server/server');

export async function setupApplication(): Promise<AppWithClient> {
  const app = new ExpressServer({
    rest: givenHttpServerConfig(),
  });

  await app.boot();
  await app.start();

  const client = supertest(app.url);

  return {app, client};
}

export interface AppWithClient {
  app: ExpressServer;
  client: Client;
}

/**
 * Generate a complete Coffee object for use with tests.
 */
export function givenCoffeeShop() {
  const CoffeeShop = lb3app.models.CoffeeShop;

  const data = {
    name: 'Coffee Shop',
    city: 'Toronto',
  };

  return new CoffeeShop(data);
}
