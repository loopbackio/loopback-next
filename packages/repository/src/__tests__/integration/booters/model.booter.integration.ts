// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, TestSandbox} from '@loopback/testlab';
import {resolve} from 'path';
import {BooterApp} from '../../fixtures/booters/application';

describe('repository booter integration tests', () => {
  const sandbox = new TestSandbox(resolve(__dirname, '../../../.sandbox'));

  const MODELS_TAG = 'model';

  let app: BooterApp;

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getApp);

  it('boots repositories when app.boot() is called', async () => {
    const expectedBindings = [
      'models.Model1',
      'models.Model2',
      'models.NoEntity',
      'models.Product',
    ];

    await app.boot();

    const bindings = app.findByTag(MODELS_TAG).map(b => b.key);
    expect(bindings.sort()).to.eql(expectedBindings.sort());
  });

  async function getApp() {
    await sandbox.copyFile(
      resolve(__dirname, '../../fixtures/booters/application.js'),
    );
    await sandbox.copyFile(
      resolve(__dirname, '../../fixtures/booters/no-entity.model.js'),
      'models/no-entity.model.js',
    );
    await sandbox.copyFile(
      resolve(__dirname, '../../fixtures/booters/product.model.js'),
      'models/product.model.js',
    );

    await sandbox.copyFile(
      resolve(__dirname, '../../fixtures/booters/multiple-models.model.js'),
      'models/multiple-models.model.js',
    );

    const MyApp = require(resolve(sandbox.path, 'application.js')).BooterApp;
    app = new MyApp();
  }
});
