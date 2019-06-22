// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/benchmark
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TodoListApplication} from '@loopback/example-todo';

async function main() {
  const app = new TodoListApplication({
    rest: {
      host: '127.0.0.1',
      port: 0,
    },
  });

  await app.boot();

  // use in-memory storage without filesystem persistence
  app.bind('datasources.config.db').to({connector: 'memory'});

  await app.start();

  // Tell the master thread what is our URL
  console.log(app.restServer.url);
}

main().catch(err => {
  console.log(err);
  process.exit(1);
});
