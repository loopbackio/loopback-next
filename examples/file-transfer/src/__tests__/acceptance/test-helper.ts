// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-file-transfer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
  TestSandbox,
} from '@loopback/testlab';
import path from 'path';
import {FileUploadApplication} from '../..';

export async function setupApplication(
  fileStorageDirectory?: string,
): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

  const app = new FileUploadApplication({
    rest: restConfig,
    fileStorageDirectory,
  });

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: FileUploadApplication;
  client: Client;
}

export function getSandbox() {
  const sandbox = new TestSandbox(path.resolve(__dirname, '../../../.sandbox'));
  return sandbox;
}
