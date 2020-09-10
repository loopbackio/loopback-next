// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-binding-resolution
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {BindingDemoApplication} from '../..';
import {LOGGER_SERVICE} from '../../keys';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

  const app = new BindingDemoApplication({
    rest: restConfig,
  });

  await app.boot();
  // Disable logging
  app.bind(LOGGER_SERVICE).to(() => {});
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: BindingDemoApplication;
  client: Client;
}
