// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ApplicationConfig} from '@loopback/core';
import {juggler, RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {CrudRestComponent} from '@loopback/rest-crud';
import {expect, givenHttpServerConfig, TestSandbox} from '@loopback/testlab';
import {resolve} from 'path';
import {BootMixin, ModelApiBooter} from '../..';
import {ProductRepository} from '../fixtures/product.repository';

describe('CRUD rest builder acceptance tests', () => {
  let app: BooterApp;
  const sandbox = new TestSandbox(resolve(__dirname, '../../.sandbox'));

  beforeEach('reset sandbox', () => sandbox.reset());
  beforeEach(givenAppWithDataSource);

  afterEach(stopApp);

  it('binds the controller and repository to the application', async () => {
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/product.model.js'),
      'models/product.model.js',
    );

    // when creating the config file in a real app, make sure to use
    // module.exports = <ModelCrudRestApiConfig>{...}
    // it's not used here because this is a .js file
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

    expect(app.getBinding('repositories.ProductRepository').key).to.eql(
      'repositories.ProductRepository',
    );

    expect(app.getBinding('controllers.ProductController').key).to.eql(
      'controllers.ProductController',
    );
  });

  it('uses bound repository class if it exists', async () => {
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

    app.repository(ProductRepository);

    const bindingName = 'repositories.ProductRepository';

    const binding = app.getBinding(bindingName);
    expect(binding.valueConstructor).to.eql(ProductRepository);

    // Boot & start the application
    await app.boot();
    await app.start();

    // Make sure it is still equal to the defined ProductRepository after
    // booting
    expect(app.getBinding(bindingName).valueConstructor).to.eql(
      ProductRepository,
    );

    expect(app.getBinding('controllers.ProductController').key).to.eql(
      'controllers.ProductController',
    );
  });

  it('throws if there is no base path in the config', async () => {
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
  // basePath not specified
};
      `,
    );

    // Boot the application
    await expect(app.boot()).to.be.rejectedWith(
      /Missing required field "basePath" in configuration for model Product./,
    );
  });

  it('throws if a Model is used instead of an Entity', async () => {
    await sandbox.copyFile(
      resolve(__dirname, '../fixtures/no-entity.model.js'),
      'models/no-entity.model.js',
    );

    await sandbox.writeTextFile(
      'model-endpoints/no-entity.rest-config.js',
      `
const {NoEntity} = require('../models/no-entity.model');
module.exports = {
  // this model extends Model, not Entity
  model: NoEntity,
  pattern: 'CrudRest',
  dataSource: 'db',
  basePath: '/no-entities',
};
      `,
    );

    // Boot the application
    await expect(app.boot()).to.be.rejectedWith(
      /CrudRestController requires a model that extends 'Entity'./,
    );
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
    if (app.state !== 'started') return;
    await app.stop();
  }
});
