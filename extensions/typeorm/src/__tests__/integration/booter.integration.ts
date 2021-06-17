// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, TestSandbox} from '@loopback/testlab';
import {resolve} from 'path';
import {TypeOrmBindings} from '../../';
import {TypeOrmApp} from '../fixtures/application';

describe('TypeORM connection booter integration tests', () => {
  const sandbox = new TestSandbox(resolve(__dirname, '../../.sandbox'));

  let app: TypeOrmApp;

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(getApp);

  it('boots connections when app.boot() is called', async () => {
    const expectedBindings = [`${TypeOrmBindings.PREFIX}.my-db`];
    await app.boot();
    const bindings = app.findByTag(TypeOrmBindings.TAG).map(b => b.key);
    expect(bindings.sort()).to.eql(expectedBindings.sort());
  });

  async function getApp() {
    await sandbox.copyFile(resolve(__dirname, '../fixtures/application.js'));
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
    const MyApp = require(resolve(sandbox.path, 'application.js')).TypeOrmApp;
    app = new MyApp();
  }
});
