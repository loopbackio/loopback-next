// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-hello-world
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {HelloWorldApplication} from './application';

export async function main() {
  const app = new HelloWorldApplication();
  await app.start();
  return app;
}
