// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {expect, sinon, TestSandbox} from '@loopback/testlab';
import {resolve} from 'path';
import {
  ApplicationUsingTypeOrm,
  ConnectionDefaults,
  TypeOrmBindings,
  TypeOrmConnectionBooter,
  TypeOrmMixin,
} from '../../';

describe('TypeORM connection booter unit tests', () => {
  const sandbox = new TestSandbox(resolve(__dirname, '../../../.sandbox'));

  class AppUsingTypeOrm extends TypeOrmMixin(Application) {}

  let app: AppUsingTypeOrm;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stub: sinon.SinonStub<[any?, ...any[]], void>;

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getApp);
  beforeEach(createStub);
  afterEach(restoreStub);

  it('gives a warning if called on an app without TypeOrmMixin', async () => {
    const normalApp = new Application();
    await sandbox.copyFile(
      resolve(
        __dirname,
        '../fixtures/typeorm-connections/sqlite.connection.js',
      ),
      'typeorm-connections/sqlite.connection.js',
    );
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/typeorm-entities/book.entity.js'),
      'typeorm-entities/book.entity.js',
    );
    const booterInst = new TypeOrmConnectionBooter(
      normalApp as ApplicationUsingTypeOrm,
      sandbox.path,
    );

    booterInst.discovered = [resolve(sandbox.path, 'sqlite.connection.js')];
    await booterInst.load();

    sinon.assert.calledOnce(stub);
    sinon.assert.calledWith(
      stub,
      'app.connection() function is needed for TypeOrmConnectionBooter. You can add ' +
        'it to your Application using TypeOrmMixin from @loopback/typeorm.',
    );
  });

  it(`uses ConnectionDefaults for 'options' if none are given`, () => {
    const booterInst = new TypeOrmConnectionBooter(app, sandbox.path);
    expect(booterInst.options).to.deepEqual(ConnectionDefaults);
  });

  it('overrides defaults with provided options and uses defaults for the rest', () => {
    const options = {
      dirs: ['test'],
      extensions: ['.ext1'],
    };
    const expected = Object.assign({}, options, {
      nested: ConnectionDefaults.nested,
    });

    const booterInst = new TypeOrmConnectionBooter(app, sandbox.path, options);
    expect(booterInst.options).to.deepEqual(expected);
  });

  it('binds connections during the load phase', async () => {
    const expected = [`${TypeOrmBindings.PREFIX}.my-db`];
    await sandbox.copyFile(
      resolve(
        __dirname,
        '../fixtures/typeorm-connections/sqlite.connection.js',
      ),
      'typeorm-connections/sqlite.connection.js',
    );
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/typeorm-entities/book.entity.js'),
      'typeorm-entities/book.entity.js',
    );
    const booterInst = new TypeOrmConnectionBooter(app, sandbox.path);
    const NUM_CONNECTIONS = 1; // 1 connection in above file.

    booterInst.discovered = [
      resolve(sandbox.path, 'typeorm-connections/sqlite.connection.js'),
    ];
    await booterInst.load();

    const connections = app.findByTag(TypeOrmBindings.TAG);
    const keys = connections.map(binding => binding.key);
    expect(keys).to.have.lengthOf(NUM_CONNECTIONS);
    expect(keys.sort()).to.eql(expected.sort());
  });

  function getApp() {
    app = new AppUsingTypeOrm();
  }

  function restoreStub() {
    stub.restore();
  }

  function createStub() {
    stub = sinon.stub(console, 'warn');
  }
});
