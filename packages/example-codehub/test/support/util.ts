// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {supertest} from '@loopback/testlab';
import {CodeHubApplication} from '../../src/CodeHubApplication';

export async function createClientForApp(app: CodeHubApplication) {
  const url = (await app.info()).url;
  return supertest(url);
}

export function createApp() {
  const app = new CodeHubApplication();
  app.bind('servers.http.port').to(0);
  return app;
}

export async function createAppAndClient() {
  const app = createApp();
  await app.start();
  const client = await createClientForApp(app);
  return {app, client};
}
