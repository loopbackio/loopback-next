// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-lb3-application
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ApplicationConfig} from '@loopback/core';
import {ExpressServer} from './server';

export {ExpressServer};

export async function main(options: ApplicationConfig = {}) {
  const server = new ExpressServer(options);
  await server.boot();
  await server.start();
  console.log(`Server is running at ${server.url}`);
}
