// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {
  ApplicationWithRepositories,
  RepositoryMixin,
} from '@loopback/repository';
import {expect, sinon, TestSandbox} from '@loopback/testlab';
import {resolve} from 'path';
import {DataSourceBooter, DataSourceDefaults} from '../../..';

describe('datasource booter unit tests', () => {
  const SANDBOX_PATH = resolve(__dirname, '../../../.sandbox');
  const sandbox = new TestSandbox(SANDBOX_PATH);

  const DATASOURCES_PREFIX = 'datasources';
  const DATASOURCES_TAG = 'datasource';

  class AppWithRepo extends RepositoryMixin(Application) {}

  let app: AppWithRepo;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stub: sinon.SinonStub<[any?, ...any[]], void>;

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getApp);
  beforeEach(createStub);
  afterEach(restoreStub);

  it('gives a warning if called on an app without RepositoryMixin', async () => {
    const normalApp = new Application();
    await sandbox.copyFile(
      resolve(__dirname, '../../fixtures/datasource.artifact.js'),
    );

    const booterInst = new DataSourceBooter(
      normalApp as ApplicationWithRepositories,
      SANDBOX_PATH,
    );

    booterInst.discovered = [resolve(SANDBOX_PATH, 'datasource.artifact.js')];
    await booterInst.load();

    sinon.assert.calledOnce(stub);
    sinon.assert.calledWith(
      stub,
      'app.dataSource() function is needed for DataSourceBooter. You can add ' +
        'it to your Application using RepositoryMixin from @loopback/repository.',
    );
  });

  it(`uses DataSourceDefaults for 'options' if none are given`, () => {
    const booterInst = new DataSourceBooter(app, SANDBOX_PATH);
    expect(booterInst.options).to.deepEqual(DataSourceDefaults);
  });

  it('overrides defaults with provided options and uses defaults for the rest', () => {
    const options = {
      dirs: ['test'],
      extensions: ['.ext1'],
    };
    const expected = Object.assign({}, options, {
      nested: DataSourceDefaults.nested,
    });

    const booterInst = new DataSourceBooter(app, SANDBOX_PATH, options);
    expect(booterInst.options).to.deepEqual(expected);
  });

  it('binds datasources during the load phase', async () => {
    const expected = [`${DATASOURCES_PREFIX}.db`];
    await sandbox.copyFile(
      resolve(__dirname, '../../fixtures/datasource.artifact.js'),
    );
    const booterInst = new DataSourceBooter(app, SANDBOX_PATH);
    const NUM_CLASSES = 1; // 1 class in above file.

    booterInst.discovered = [resolve(SANDBOX_PATH, 'datasource.artifact.js')];
    await booterInst.load();

    const datasources = app.findByTag(DATASOURCES_TAG);
    const keys = datasources.map(binding => binding.key);
    expect(keys).to.have.lengthOf(NUM_CLASSES);
    expect(keys.sort()).to.eql(expected.sort());
  });

  function getApp() {
    app = new AppWithRepo();
  }

  function restoreStub() {
    stub.restore();
  }

  function createStub() {
    stub = sinon.stub(console, 'warn');
  }
});
