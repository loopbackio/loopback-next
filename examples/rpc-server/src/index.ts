// Copyright The LoopBack Authors 2018,2021. All Rights Reserved.
// Node module: @loopback/example-rpc-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ApplicationConfig, MyApplication} from './application';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new MyApplication(options);

  await app.start();
  console.log(`Server is running on port ${app.options.port}`);
  return app;
}

if (require.main === module) {
  // Run the application
  main().catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
