// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/remote-repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Entity,
  EntityCrudRepository,
  juggler,
  model,
  property,
  RepositoryMixin,
} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {CrudRestApiBuilder} from '@loopback/rest-crud';
import {expect, givenHttpServerConfig} from '@loopback/testlab';
import {RemoteCrudRepository} from '../..';

const crudRestApiBuilder = new CrudRestApiBuilder();

describe('RemoteCrudRepository', () => {
  let remoteApp: AppWithRepos;
  before(givenRunningRemoteRestApp);
  after(stopRemoteApp);

  let localApp: AppWithRepos;
  let localOpenApiDs: juggler.DataSource;
  let localProductRepo: ProductRepository;

  before(givenLocalAppWithArtifacts);

  beforeEach(resetData);

  //
  // Models shared by the remote and the local application
  //

  @model()
  class Product extends Entity {
    @property({id: true})
    id: number;

    @property({required: true})
    name: string;

    constructor(data?: Partial<Product>) {
      super(data);
    }
  }

  interface ProductRelations {
    // TBD
  }

  //
  // Local application's Repositories to access the model data persisted
  // by the remote application.
  //

  class ProductRepository extends RemoteCrudRepository<
    Product,
    typeof Product.prototype.id,
    ProductRelations
  > {
    constructor(dataSource: juggler.DataSource) {
      super(Product, dataSource);
    }
  }

  describe('find', () => {
    it('returns all records when no filter is provided', async () => {
      const pen = await givenProductInstance({name: 'Pen'});
      const pencil = await givenProductInstance({name: 'Pencil'});

      const found = await localProductRepo.find();
      expect(found).to.deepEqual([pen, pencil]);
    });

    it('supports `filter.where`', async () => {
      const pen = await givenProductInstance({name: 'Pen'});
      await givenProductInstance({name: 'Pencil'});

      const found = await localProductRepo.find({where: {name: 'Pen'}});
      expect(found).to.deepEqual([pen]);
    });
  });

  describe('create', () => {
    it('creates a new model instance', async () => {
      const created = await localProductRepo.create({name: 'Car'});
      expect(created).to.deepEqual(new Product({id: created.id, name: 'Car'}));

      const repoInRemoteApp = await getProductRepoInRemoteApp();
      const found = await repoInRemoteApp.find();
      expect(found).to.deepEqual([created]);
    });
  });

  class AppWithRepos extends RepositoryMixin(RestApplication) {}

  async function givenRunningRemoteRestApp() {
    remoteApp = new AppWithRepos({
      name: 'RemoteApplication',
      rest: {
        ...givenHttpServerConfig(),
        openApiSpec: {
          // prevent Error: only absolute urls are supported
          setServersFromRequest: true,
        },
      },
    });

    remoteApp.dataSource(
      new juggler.DataSource({
        name: 'db',
        connector: 'memory',
      }),
    );

    await crudRestApiBuilder.build(remoteApp, Product, {
      model: Product,
      pattern: 'rest-crud',
      dataSource: 'db',
      basePath: '/products',
    });

    return remoteApp.start();
  }

  function stopRemoteApp() {
    return remoteApp.stop();
  }

  async function givenLocalAppWithArtifacts() {
    localApp = new AppWithRepos({
      name: 'LocalApplication',
      rest: givenHttpServerConfig(),
    });

    localOpenApiDs = new juggler.DataSource({
      name: 'remote',
      connector: require('loopback-connector-openapi'),
      spec: remoteApp.restServer.url + '/openapi.json',
      validate: false,
      positional: false,
    });
    localApp.dataSource(localOpenApiDs);

    localProductRepo = new ProductRepository(localOpenApiDs);
  }

  async function resetData() {
    const repo = await getProductRepoInRemoteApp();
    await repo.deleteAll();
  }

  async function getProductRepoInRemoteApp() {
    return remoteApp.get<
      EntityCrudRepository<
        Product,
        typeof Product.prototype.id,
        ProductRelations
      >
    >('repositories.ProductRepository');
  }

  async function givenProductInstance(data: Partial<Product>) {
    const repo = await getProductRepoInRemoteApp();
    return repo.create(data);
  }
});
