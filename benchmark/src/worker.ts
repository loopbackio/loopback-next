// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/benchmark
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Request,
  RestBindings,
  TodoListApplication,
} from '@loopback/example-todo';

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

  // overwrite the error logger to print all failed requests, including 4xx
  app.bind(RestBindings.SequenceActions.LOG_ERROR).to(logAllErrors);

  await app.start();

  // Tell the master thread what is our URL
  console.log('Server listening at', app.restServer.url);
  if (process.send) {
    process.send({url: app.restServer.url});
  }
}

main().catch(err => {
  console.log(err);
  process.exit(1);
});

function logAllErrors(err: Error, statusCode: number, req: Request) {
  console.error(
    'Request %s %s failed: %s',
    req.method,
    req.url,
    statusCode,
    err,
  );
}
