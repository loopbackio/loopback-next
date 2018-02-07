// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, TestSandbox} from '@loopback/testlab';
import {CoreBindings} from '@loopback/core';
import {resolve} from 'path';
import {ControllerBooterApp} from '../fixtures/application';

describe('controller booter integration tests', () => {
  const SANDBOX_PATH = resolve(__dirname, '../../.sandbox');
  const sandbox = new TestSandbox(SANDBOX_PATH);
  let app: ControllerBooterApp;

  beforeEach(resetSandbox);
  beforeEach(getApp);

  it('boots controllers when app.boot() is called', async () => {
    const expectedBindings = [
      `${CoreBindings.CONTROLLERS_PREFIX}.ControllerOne`,
      `${CoreBindings.CONTROLLERS_PREFIX}.ControllerTwo`,
    ];

    await app.boot();

    const bindings = app
      .findByTag(CoreBindings.CONTROLLERS_TAG)
      .map(b => b.key);
    expect(bindings.sort()).to.eql(expectedBindings.sort());
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

  async function resetSandbox() {
    await sandbox.reset();
  }
});
