// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, TestSandbox} from '@loopback/testlab';
import {resolve} from 'path';
import {BooterApp} from '../fixtures/application';
import {UserServiceBindingKey} from '../fixtures/config-script-artifact';

describe('controller booter integration tests', () => {
  const sandbox = new TestSandbox(resolve(__dirname, '../../.sandbox'));

  let app: BooterApp;

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getApp);

  it('boots controllers when app.boot() is called', async () => {
    await app.boot();
    const bindings = app.find(UserServiceBindingKey).map(b => b.key);
    expect(bindings).to.equal([UserServiceBindingKey]);
  });

  async function getApp() {
    await sandbox.copyFile(resolve(__dirname, '../fixtures/application.js'));
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/config-script-artifact.js'),
      'config/user-service.config.js',
    );

    const MyApp = require(resolve(sandbox.path, 'application.js')).BooterApp;
    app = new MyApp();
  }
});
