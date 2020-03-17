// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-file-transfer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/* istanbul ignore file */
import {ApplicationConfig} from '@loopback/core';
import {FileUploadApplication} from './application';

export {FileUploadApplication};

export async function main(options: ApplicationConfig = {}) {
  const app = new FileUploadApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);

  return app;
}
