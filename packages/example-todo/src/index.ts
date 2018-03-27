// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TodoListApplication} from './application';
import {ApplicationConfig} from '@loopback/core';
import {RestServer} from '@loopback/rest';

export async function main(options?: ApplicationConfig) {
  const app = new TodoListApplication(options);
  await app.boot();
  await app.start();

  const server = await app.getServer(RestServer);
  const port = await server.get<number>('rest.port');
  console.log(`Server is running at http://127.0.0.1:${port}`);
  return app;
}
