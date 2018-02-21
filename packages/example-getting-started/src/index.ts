// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-getting-started
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TodoApplication} from './application';
import {RestServer} from '@loopback/rest';

export async function main() {
  const app = new TodoApplication();
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
