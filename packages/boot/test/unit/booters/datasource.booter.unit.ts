// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, TestSandbox, sinon} from '@loopback/testlab';
import {DataSourceBooter, DatasourceDefaults} from '../../../index';
import {resolve} from 'path';
import {
  DataSourceConstructor,
  DataSourceType,
  RepositoryMixin,
} from '@loopback/repository';
import {Application} from '@loopback/core';

describe('datasource booter unit tests', () => {
  const SANDBOX_PATH = resolve(__dirname, '../../../.sandbox');
  const sandbox = new TestSandbox(SANDBOX_PATH);

  const DATASOURCES_PREFIX = 'datasources';

  class RepoApp extends RepositoryMixin(Application) {}

  let app: RepoApp;
  let stub: sinon.SinonStub;

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getApp);
  beforeEach(createStub);
  afterEach(restoreStub);

  it('gives a warning if called on an app without RepositoryMixin', async () => {
    const normalApp = new Application();
    await sandbox.copyFile(
      resolve(__dirname, '../../fixtures/multiple.artifact.js'),
    );

    const booterInst = new DataSourceBooter(normalApp as RepoApp, SANDBOX_PATH);

    // Load uses discovered property
    booterInst.discovered = [resolve(SANDBOX_PATH, 'multiple.artifact.js')];
    await booterInst.load();

    sinon.assert.calledOnce(stub);
    sinon.assert.calledWith(
      stub,
      'app.dataSource() function is needed for DataSourceBooter. You can add it ' +
        'to your Application using RepositoryMixin from @loopback/repository.',
    );
  });

  it(`constructor uses DataSourceDefaults for 'options' if none are given`, () => {
    const booterInst = new DataSourceBooter(app, SANDBOX_PATH);
    expect(booterInst.options).to.deepEqual(DatasourceDefaults);
  });

  it('overrides defaults with provided options and uses defaults for rest', () => {
    const options = {
      dirs: ['test', 'test2'],
      extensions: ['.ext1', 'ext2'],
    };
    const expected = Object.assign({}, options, {
      nested: DatasourceDefaults.nested,
    });

    const booterInst = new DataSourceBooter(app, SANDBOX_PATH, options);
    expect(booterInst.options).to.deepEqual(expected);
  });

  it('creates and binds datasource during load phase', async () => {
    await sandbox.copyFile(
      resolve(__dirname, '../../fixtures/db.datasource.json'),
    );
    const booterInst = new DataSourceBooter(app, SANDBOX_PATH);

    // Load uses discovered property
    booterInst.discovered = [resolve(SANDBOX_PATH, 'db.datasource.json')];
    await booterInst.load();

    const ds = await app.get<DataSourceType>(`${DATASOURCES_PREFIX}.db`);
    expect(ds).to.be.an.instanceof(DataSourceConstructor);
    expect(ds.name).to.be.eql('db');
  });

  it("doesn't bind a datasource without a name", async () => {
    const file = 'no-name.datasource.json';
    await sandbox.copyFile(resolve(__dirname, `../../fixtures/${file}`));
    const booterInst = new DataSourceBooter(app, SANDBOX_PATH);

    booterInst.discovered = [resolve(SANDBOX_PATH, file)];
    await booterInst.load();

    sinon.assert.calledOnce(stub);
    sinon.assert.calledWith(
      stub,
      `${resolve(
        SANDBOX_PATH,
        file,
      )} was not initialized as a DataSourceConstructor because the 'name' property was missing.`,
    );
  });

  function restoreStub() {
    stub.restore();
  }

  function createStub() {
    stub = sinon.stub(console, 'warn');
  }

  function getApp() {
    app = new RepoApp();
  }
});
