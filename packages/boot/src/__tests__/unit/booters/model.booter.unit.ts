// Copyright IBM Corp. and LoopBack contributors 2025. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {
  ApplicationWithRepositories,
  RepositoryMixin,
} from '@loopback/repository';
import {expect, TestSandbox} from '@loopback/testlab';
import {resolve} from 'path';
import {ModelBooter, ModelDefaults} from '../../..';

describe('model booter unit tests', () => {
  const sandbox = new TestSandbox(resolve(__dirname, '../../../.sandbox'));

  const MODELS_PREFIX = 'models';
  const MODELS_TAG = 'model';

  class AppWithRepo extends RepositoryMixin(Application) {}

  let app: ApplicationWithRepositories;

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getApp);

  it(`uses ModelDefaults for 'options' if none are given`, () => {
    const booterInst = new ModelBooter(app, sandbox.path);
    expect(booterInst.options).to.deepEqual(ModelDefaults);
  });

  it('overrides defaults with provided options and uses defaults for the rest', () => {
    const options = {
      dirs: ['test'],
      extensions: ['.ext1'],
    };
    const expected = Object.assign({}, options, {
      nested: ModelDefaults.nested,
    });

    const booterInst = new ModelBooter(app, sandbox.path, options);
    expect(booterInst.options).to.deepEqual(expected);
  });

  it('binds model classes during the load phase', async () => {
    await sandbox.copyFile(
      resolve(__dirname, '../../fixtures/product.model.js'),
      'models/product.model.js',
    );
    const booterInst = new ModelBooter(app, sandbox.path);

    booterInst.discovered = [resolve(sandbox.path, 'models/product.model.js')];
    await booterInst.load();

    const keys = app.findByTag(MODELS_TAG).map(b => b.key);
    expect(keys).to.eql([`${MODELS_PREFIX}.Product`]);
  });

  function getApp() {
    app = new AppWithRepo();
  }
});
