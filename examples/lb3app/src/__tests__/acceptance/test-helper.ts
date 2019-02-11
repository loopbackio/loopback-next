// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-lb3app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CoffeeShopsApplication} from '../..';
import {
  createRestAppClient,
  givenHttpServerConfig,
  Client,
} from '@loopback/testlab';

export async function setupApplication(): Promise<AppWithClient> {
  const app = new CoffeeShopsApplication({
    rest: givenHttpServerConfig(),
  });

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: CoffeeShopsApplication;
  client: Client;
}
