// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-multi-tenancy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ExampleMultiTenancyApplication} from './application';
import {ApplicationConfig} from '@loopback/core';

export {ExampleMultiTenancyApplication};

export async function main(options: ApplicationConfig = {}) {
  const app = new ExampleMultiTenancyApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}
