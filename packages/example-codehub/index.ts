// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-codehub
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

  await app.start();
  console.log('Application Info:', app.info());
}
