// Copyright IBM Corp. 2013,2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, createClientForHandler, TestSandbox} from '@loopback/testlab';
import {RestServer} from '@loopback/rest';
import {resolve} from 'path';
import {ControllerBooterApp} from '../fixtures/application';

describe('controller booter acceptance tests', () => {
  let app: ControllerBooterApp;
  const SANDBOX_PATH = resolve(__dirname, '../../.sandbox');
  const sandbox = new TestSandbox(SANDBOX_PATH);

  beforeEach(resetSandbox);
  beforeEach(getApp);

  afterEach(stopApp);

  it('binds controllers using ControllerDefaults and REST endpoints work', async () => {
    await app.boot();
    await app.start();

    const server: RestServer = await app.getServer(RestServer);
    const client: Client = createClientForHandler(server.handleHttp);

    // Default Controllers = /controllers with .controller.js ending (nested = true);
    await client.get('/one').expect(200, 'ControllerOne.one()');
    await client.get('/two').expect(200, 'ControllerTwo.two()');
  });

  async function getApp() {
    await sandbox.copyFile(resolve(__dirname, '../fixtures/application.js'));
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/application.js.map'),
    );
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/multiple.artifact.js'),
      'controllers/multiple.controller.js',
    );
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/multiple.artifact.js.map'),
      'controllers/multiple.artifact.js.map',
    );

    const BooterApp = require(resolve(SANDBOX_PATH, 'application.js'))
      .ControllerBooterApp;

    app = new BooterApp();
  }

  async function stopApp() {
    try {
      await app.stop();
    } catch (err) {
      console.log(`Stopping the app threw an error: ${err}`);
    }
  }

  async function resetSandbox() {
    await sandbox.reset();
  }
});
