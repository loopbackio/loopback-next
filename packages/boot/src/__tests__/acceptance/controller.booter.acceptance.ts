// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  createRestAppClient,
  givenHttpServerConfig,
  TestSandbox,
} from '@loopback/testlab';
import {resolve} from 'path';
import {BooterApp} from '../fixtures/application';

describe('controller booter acceptance tests', () => {
  let app: BooterApp;
  const sandbox = new TestSandbox(resolve(__dirname, '../../.sandbox'));

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getApp);

  afterEach(stopApp);

  it('binds controllers using ControllerDefaults and REST endpoints work', async () => {
    await app.boot();
    await app.start();

    const client = createRestAppClient(app);

    // Default Controllers = /controllers with .controller.js ending (nested = true);
    await client.get('/one').expect(200, 'ControllerOne.one()');
    await client.get('/two').expect(200, 'ControllerTwo.two()');
  });

  async function getApp() {
    await sandbox.copyFile(resolve(__dirname, '../fixtures/package.json'));
    await sandbox.copyFile(resolve(__dirname, '../fixtures/application.js'));
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/multiple.artifact.js'),
      'controllers/multiple.controller.js',
    );

    const MyApp = require(resolve(sandbox.path, 'application.js')).BooterApp;
    app = new MyApp({
      rest: givenHttpServerConfig(),
    });
  }

  async function stopApp() {
    try {
      await app.stop();
    } catch (err) {
      console.log(`Stopping the app threw an error: ${err}`);
    }
  }
});
