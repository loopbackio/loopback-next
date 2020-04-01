// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CoreBindings} from '@loopback/core';
import {expect, givenHttpServerConfig, TestSandbox} from '@loopback/testlab';
import {resolve} from 'path';
import {BooterApp} from '../fixtures/application';

describe('application metadata booter acceptance tests', () => {
  let app: BooterApp;
  const sandbox = new TestSandbox(resolve(__dirname, '../../.sandbox'));

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getApp);

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
    // Add the following files
    // - package.json
    // - dist/application.js
    await sandbox.copyFile(resolve(__dirname, '../fixtures/package.json'));
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/application.js'),
      'dist/application.js',
    );

    const MyApp = require(resolve(sandbox.path, 'dist/application.js'))
      .BooterApp;
    app = new MyApp({
      rest: givenHttpServerConfig(),
    });
  }
});
