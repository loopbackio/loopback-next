// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TodoListApplication} from './application';
import {ApplicationConfig} from '@loopback/core';

export async function main(options?: ApplicationConfig) {
  // IBM Cloud app port is set on process.env.PORT
  if (!options) {
    options = {rest: {port: process.env.PORT}};
  } else {
    if (!options.rest) options.rest = {};
    options.rest.port = process.env.PORT || options.rest.port;
  }
  const app = new TodoListApplication(options);

  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  return app;
}
