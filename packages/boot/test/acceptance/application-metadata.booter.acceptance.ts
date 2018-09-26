// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {givenHttpServerConfig, TestSandbox, expect} from '@loopback/testlab';
import {resolve} from 'path';
import {BooterApp} from '../fixtures/application';
import {CoreBindings} from '@loopback/core';

describe('application metadata booter acceptance tests', () => {
  let app: BooterApp;
  const SANDBOX_PATH = resolve(__dirname, '../../.sandbox');
  const sandbox = new TestSandbox(SANDBOX_PATH);

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getApp);

  afterEach(stopApp);

  it('binds content of package.json to application metadata', async () => {
    await app.boot();
    const metadata = await app.get(CoreBindings.APPLICATION_METADATA);
    expect(metadata).containEql({
      name: 'boot-test-app',
      version: '1.0.0',
      description: 'boot-test-app',
    });
  });

  async function getApp() {
    await sandbox.copyFile(resolve(__dirname, '../fixtures/package.json'));
    await sandbox.copyFile(resolve(__dirname, '../fixtures/application.js'));

    const MyApp = require(resolve(SANDBOX_PATH, 'application.js')).BooterApp;
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
