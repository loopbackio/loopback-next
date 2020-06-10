// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CoreBindings} from '@loopback/core';
import {expect, givenHttpServerConfig, TestSandbox} from '@loopback/testlab';
import fs from 'fs';
import {resolve} from 'path';
import {BooterApp} from '../fixtures/application';

describe('application metadata booter acceptance tests', () => {
  let app: BooterApp;
  const sandbox = new TestSandbox(resolve(__dirname, '../../.sandbox'));

  beforeEach(getApp);
  after('delete sandbox', () => sandbox.delete());

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

    const appJsFile = resolve(__dirname, '../fixtures/application.js');
    let appJs = fs.readFileSync(appJsFile, 'utf-8');
    // Adjust the relative path for `import`
    appJs = appJs.replace('../..', '../../..');
    await sandbox.writeTextFile('dist/application.js', appJs);

    await sandbox.copyFile(resolve(__dirname, '../fixtures/package.json'));

    const MyApp = require(resolve(sandbox.path, 'dist/application.js'))
      .BooterApp;

    app = new MyApp({
      rest: givenHttpServerConfig(),
    });
  }
});
