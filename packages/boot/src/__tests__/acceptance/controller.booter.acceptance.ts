// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, givenHttpServerConfig, TestSandbox} from '@loopback/testlab';
import {resolve} from 'path';
import {BooterApp} from '../fixtures/application';

describe('controller booter acceptance tests', () => {
  let app: BooterApp;
  const sandbox = new TestSandbox(resolve(__dirname, '../../.sandbox'));

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getApp);

  it('binds controllers using ControllerDefaults', async () => {
    await app.boot();
    const bindings = app.find('controllers.*');
    expect(bindings.length).to.eql(2);
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
});
