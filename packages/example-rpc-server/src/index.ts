// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: some-project
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MyApplication} from './application';
import {ApplicationConfig} from '@loopback/core';

export async function main(options?: ApplicationConfig) {
  const app = new MyApplication(options);

  try {
    await app.start();
  } catch (err) {
    console.error(`Unable to start application: ${err}`);
  }
  return app;
}

main().catch(err => {
  console.error('Unhandled exception!');
});
