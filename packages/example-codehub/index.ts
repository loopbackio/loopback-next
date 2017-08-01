// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CodeHubApplication} from './src/codehub-application';

// tslint:disable-next-line:no-floating-promises
main().catch(err => {
  console.log('Cannot start the app.', err);
  process.exit(1);
});

async function main(): Promise<void> {
  const app = new CodeHubApplication();
  const logger = app.getSync('logger.system.loggerProvider');

  await app.start();
  logger.info('Application Info:', app.info());
}
