// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, TestSandbox} from '@loopback/testlab';
import {resolve} from 'path';
import {BooterApp} from '../fixtures/application';

describe('datasource booter integration tests', () => {
  const sandbox = new TestSandbox(resolve(__dirname, '../../.sandbox'));

  const DATASOURCES_PREFIX = 'datasources';
  const DATASOURCES_TAG = 'datasource';

  let app: BooterApp;

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getApp);

  it('boots datasources when app.boot() is called', async () => {
    const expectedBindings = [`${DATASOURCES_PREFIX}.db`];

    await app.boot();

    const bindings = app.findByTag(DATASOURCES_TAG).map(b => b.key);
    expect(bindings.sort()).to.eql(expectedBindings.sort());
  });

  async function getApp() {
    await sandbox.copyFile(resolve(__dirname, '../fixtures/application.js'));
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/datasource.artifact.js'),
      'datasources/db.datasource.js',
    );

    const MyApp = require(resolve(sandbox.path, 'application.js')).BooterApp;
    app = new MyApp();
  }
});
