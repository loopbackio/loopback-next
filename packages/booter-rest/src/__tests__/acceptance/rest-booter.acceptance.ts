// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/booter-rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  DefaultCrudRepository,
  Entity,
  juggler,
  model,
  property,
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
import {RestBooter} from '../../rest.booter';

describe('rest booter acceptance tests', () => {
  let app: BooterApp;
  const SANDBOX_PATH = resolve(__dirname, '../../.sandbox');
  const sandbox = new TestSandbox(SANDBOX_PATH);

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(givenAppWithDataSource);

  afterEach(stopApp);

  it('exposes models via CRUD REST API', async () => {
    // Define the model. While we could do this via ModelBooter, it's usually
    // easier to do so directly from code - the test is easier to read.
    @model()
    class Product extends Entity {
      @property({id: true})
      id: number;

      @property({required: true})
      name: string;
    }
    app.model(Product);

    // Write model-config file to specify how to expose the model via API
    await sandbox.writeJsonFile('public-models/product.config.json', {
      model: 'Product',
      pattern: 'CrudRest',
      dataSource: 'db',
      basePath: '/products',
    });

    await app.boot();
    await app.start();

    const client = createRestAppClient(app);

    const created = await client
      .post('/products')
      .send({name: 'a name'})
      .expect(200);
    const found = await client.get('/products').expect(200);
    expect(found.body).to.deepEqual([{id: created.body.id, name: 'a name'}]);

    // verify that we have a repository class to use e.g. in tests
    const repo = await app.get<
      DefaultCrudRepository<Product, typeof Product.prototype.id>
    >('repositories.ProductRepository');
    const stored = await repo.find();
    expect(toJSON(stored)).to.deepEqual(found.body);
  });

  class BooterApp extends BootMixin(RepositoryMixin(RestApplication)) {
    constructor(options?: ApplicationConfig) {
      super(options);
      this.projectRoot = sandbox.path + '/dist';
      this.booters(RestBooter);
      this.component(CrudRestComponent);
    }
  }

  async function givenAppWithDataSource() {
    await sandbox.mkdir('dist');
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
