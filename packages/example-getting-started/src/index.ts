// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-getting-started
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TodoListApplication} from './application';
import {ApplicationConfig} from '@loopback/core';
import {RestServer} from '@loopback/rest';

export async function main(options?: ApplicationConfig) {
  const app = new TodoListApplication(options);
  try {
    await app.boot();
    await app.start();
  } catch (err) {
    console.error(`Unable to start application: ${err}`);
  }
  const server = await app.getServer(RestServer);
  console.log(`Server is running on port ${await server.get('rest.port')}`);
  return app;
}
