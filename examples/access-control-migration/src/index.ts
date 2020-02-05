// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-access-control-migration
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AccessControlApplication} from './application';
import {ApplicationConfig} from '@loopback/core';

export async function main(options: ApplicationConfig = {}) {
  const app = new AccessControlApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  return app;
}

// re-exports for our benchmark, not needed for the tutorial itself
export {AccessControlApplication};

export * from './models';
export * from './repositories';
export * from '@loopback/rest';
