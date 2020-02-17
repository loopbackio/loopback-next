// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/example-coffeeshop
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ApplicationConfig} from '@loopback/core';
import {CoffeeshopApplication} from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new CoffeeshopApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  return app;
}

export * from '@loopback/rest';
// export * from './models';
// export * from './repositories';
// re-exports for our benchmark, not needed for the tutorial itself
export {CoffeeshopApplication};
