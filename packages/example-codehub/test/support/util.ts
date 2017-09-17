// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {supertest} from '@loopback/testlab';
import {RestBindings} from '@loopback/rest';
import {CodeHubApplication} from '../../src/codehub-application';
import {RestServer} from '../../../rest/src/rest-server';

export async function createClientForApp(app: CodeHubApplication) {
  const url = (await app.info()).url;
  return supertest(url);
}

export async function createApp() {
  const app = new CodeHubApplication();
  const server = await app.getServer(RestServer);
  server.bind(RestBindings.PORT).to(0);
  return app;
}

export async function createAppAndClient() {
  const app = await createApp();
  await app.start();
  const client = await createClientForApp(app);
  return {app, client};
}
