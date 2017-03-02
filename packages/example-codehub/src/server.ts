// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, Server} from 'loopback';
import {UserController} from './controllers/UserController';

// tslint:disable-next-line:no-floating-promises
main().catch(err => {
  console.log('Cannot start the app.', err);
  process.exit(1);
});

async function main(): Promise<void> {
  const app = new Application();
  const server = new Server();

  app.controller(UserController);
  app.bind('userId').to(42);

  // FIXME
  // app.bind('server').to(server);
  // await app.start();
  // console.log('server listenting on', app.info());

  server.bind('applications.code-hub').to(app);
  await server.start();

  console.log('server listenting on', server.config.port);
}
