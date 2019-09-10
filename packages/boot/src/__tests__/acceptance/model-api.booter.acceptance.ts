// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ApplicationConfig} from '@loopback/core';
import {
  DefaultCrudRepository,
  juggler,
  RepositoryMixin,
} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {CrudRestComponent} from '@loopback/rest-crud';
import {
  createRestAppClient,
  expect,
  givenHttpServerConfig,
  TestSandbox,
  toJSON,
} from '@loopback/testlab';
import {resolve} from 'path';
import {BootMixin, ModelApiBooter} from '../..';
import {Product} from '../fixtures/product.model';

describe('rest booter acceptance tests', () => {
  let app: BooterApp;
  const SANDBOX_PATH = resolve(__dirname, '../../.sandbox');
  const sandbox = new TestSandbox(SANDBOX_PATH);

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(givenAppWithDataSource);

  afterEach(stopApp);

  it('exposes models via CRUD REST API', async () => {
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/product.model.js'),
      'models/product.model.js',
    );

    await sandbox.writeTextFile(
      'model-endpoints/product.rest-config.js',
      `
const {Product} = require('../models/product.model');
module.exports = {
  model: Product,
  pattern: 'CrudRest',
  dataSource: 'db',
  basePath: '/products',
};
      `,
    );

    // Boot & start the application
    await app.boot();
    await app.start();
    const client = createRestAppClient(app);

    // Verify that we have REST API for our model
    const created = await client
      .post('/products')
      .send({name: 'a name'})
      .expect(200);
    const found = await client.get('/products').expect(200);
    expect(found.body).to.deepEqual([{id: created.body.id, name: 'a name'}]);

    // Verify that we have a repository class to use e.g. in tests
    const repo = await app.get<
      DefaultCrudRepository<Product, typeof Product.prototype.id>
    >('repositories.ProductRepository');
    const stored = await repo.find();
    expect(toJSON(stored)).to.deepEqual(found.body);
  });

  class BooterApp extends BootMixin(RepositoryMixin(RestApplication)) {
    constructor(options?: ApplicationConfig) {
      super(options);
      this.projectRoot = sandbox.path;
      this.booters(ModelApiBooter);
      this.component(CrudRestComponent);
    }
  }

  async function givenAppWithDataSource() {
    app = new BooterApp({
      rest: givenHttpServerConfig(),
    });
    app.dataSource(new juggler.DataSource({connector: 'memory'}), 'db');
  }

  async function stopApp() {
    try {
      await app.stop();
    } catch (err) {
      console.error('Cannot stop the app, ignoring the error.', err);
    }
  }
});
