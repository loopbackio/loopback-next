// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-rpc-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MyApplication} from './application';
import {ApplicationConfig} from '@loopback/core';

export async function main(options: ApplicationConfig = {}) {
  const app = new MyApplication(options);

  await app.start();
  console.log(`Server is running on port ${app.options.port}`);
  return app;
}
