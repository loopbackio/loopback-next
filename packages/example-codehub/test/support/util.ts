// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {supertest} from 'testlab';
import {CodeHubApplication} from 'example-codehub/src/CodeHubApplication';

export function createClient(protocol: string, port: number) {
  const URL = `${protocol}://localhost:${port}`;
  return supertest('http://localhost:3000');
}

export function createApp() {
  return new CodeHubApplication();
}
