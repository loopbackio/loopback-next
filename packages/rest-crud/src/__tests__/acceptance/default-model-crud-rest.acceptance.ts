// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest-crud
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Entity,
  EntityCrudRepository,
  juggler,
  model,
  property,
} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
  toJSON,
} from '@loopback/testlab';
import {defineCrudRepositoryClass, defineCrudRestController} from '../..';

// In this test scenario, we create a product with a required & an optional
// property and use the default model settings (strict mode, forceId).
//
// Please don't add any other scenarios to this test file, create a new file
// for each scenario instead.

describe('CrudRestController for a simple Product model', () => {
  @model()
  class Product extends Entity {
    @property({id: true})
    id: number;

    @property({required: true})
    name: string;

    @property()
    description?: string;

    constructor(data: Partial<Product>) {
      super(data);
    }
  }

  let app: RestApplication;
  let repo: EntityCrudRepository<Product, typeof Product.prototype.id>;
  let client: Client;

  // sample data - call `seedData` to populate these items
  let pen: Product;
  let pencil: Product;

  const PATCH_DATA = {description: 'patched'};
  Object.freeze(PATCH_DATA);

  before(setupTestScenario);
  after(stopTheApp);
  beforeEach(cleanDatabase);

  describe('create', () => {
    it('creates a new Product', async () => {
      const response = await client
        .post('/products')
        .send({name: 'A pen'})
        // FIXME: POST should return 201
        // See https://github.com/strongloop/loopback-next/issues/788
        .expect(200);

      const created = response.body;
      expect(created).to.containEql({name: 'A pen'});
      expect(created)
        .to.have.property('id')
        .of.type('number');

      const found = (await repo.find())[0];
      expect(toJSON(found)).to.deepEqual(created);
    });

    it('rejects request with `id` value', async () => {
      const {body} = await client
        .post('/products')
        .send({id: 1, name: 'a name'})
        .expect(422);

      expect(body.error).to.containDeep({
        code: 'VALIDATION_FAILED',
        details: [
          {
            path: '',
            code: 'additionalProperties',
            message: 'should NOT have additional properties',
            info: {additionalProperty: 'id'},
          },
        ],
      });
    });
  });

  describe('find', () => {
    beforeEach(seedData);

    it('returns all products when no filter was provided', async () => {
      const {body} = await client.get('/products').expect(200);
      expect(body).to.deepEqual(toJSON([pen, pencil]));
    });

    it('supports `where` filter', async () => {
      const {body} = await client
        .get('/products')
        .query({'filter[where][name]': pen.name})
        .expect(200);
      expect(body).to.deepEqual(toJSON([pen /* pencil was omitted */]));
    });
  });

  describe('findById', () => {
    beforeEach(seedData);

    it('returns model with the given id', async () => {
      const {body} = await client.get(`/products/${pen.id}`).expect(200);
      expect(body).to.deepEqual(toJSON(pen));
    });

    // TODO(bajtos) to fully verify this functionality, we should create
    // a new test suite that will configure a PK with a different name
    // and type, e.g. `pk: string` instead of `id: number`.
    it('uses correct schema for the id parameter', async () => {
      const spec = app.restServer.getApiSpec();
      const findByIdOp = spec.paths['/products/{id}'].get;
      expect(findByIdOp).to.containDeep({
        parameters: [
          {
            name: 'id',
            in: 'path',
            schema: {type: 'number'},
          },
        ],
      });
    });
  });

  describe('count', () => {
    beforeEach(seedData);

    it('returns all products when no filter was provided', async () => {
      const {body} = await client.get('/products/count').expect(200);
      expect(body).to.deepEqual({count: 2});
    });

    it('supports `where` query param', async () => {
      const {body} = await client
        .get('/products/count')
        .query({'where[name]': pen.name})
        .expect(200);
      expect(body).to.deepEqual({count: 1 /* pencil was omitted */});
    });
  });

  describe('updateAll', () => {
    beforeEach(seedData);

    it('updates all products when no filter was provided', async () => {
      const {body} = await client
        .patch('/products')
        .send(PATCH_DATA)
        .expect(200);
      expect(body).to.deepEqual({count: 2});

      const stored = await repo.find();
      expect(toJSON(stored)).to.deepEqual([
        {...toJSON(pen), ...PATCH_DATA},
        {...toJSON(pencil), ...PATCH_DATA},
      ]);
    });

    it('supports `where` query param', async () => {
      const {body} = await client
        .patch('/products')
        .query({'where[name]': pen.name})
        .send(PATCH_DATA)
        .expect(200);
      expect(body).to.deepEqual({count: 1});

      const stored = await repo.find();
      expect(toJSON(stored)).to.deepEqual([
        {...toJSON(pen), ...PATCH_DATA},
        {...toJSON(pencil) /* pencil was not patched */},
      ]);
    });
  });

  describe('updateById', () => {
    beforeEach(seedData);

    it('updates model with the given id', async () => {
      await client
        .patch(`/products/${pen.id}`)
        .send(PATCH_DATA)
        .expect(204);

      const stored = await repo.find();
      expect(toJSON(stored)).to.deepEqual([
        {...toJSON(pen), ...PATCH_DATA},
        {...toJSON(pencil) /* pencil was not patched */},
      ]);
    });

    // TODO(bajtos) to fully verify this functionality, we should create
    // a new test suite that will configure a PK with a different name
    // and type, e.g. `pk: string` instead of `id: number`.
    it('uses correct schema for the id parameter', async () => {
      const spec = app.restServer.getApiSpec();
      const findByIdOp = spec.paths['/products/{id}'].patch;
      expect(findByIdOp).to.containDeep({
        parameters: [
          {
            name: 'id',
            in: 'path',
            schema: {type: 'number'},
          },
        ],
      });
    });
  });

  describe('replaceById', () => {
    beforeEach(seedData);

    it('replaces model with the given id', async () => {
      const newData = Object.assign({}, pen.toJSON(), PATCH_DATA);
      await client
        .put(`/products/${pen.id}`)
        .send(newData)
        .expect(204);

      const stored = await repo.find();
      expect(toJSON(stored)).to.deepEqual([
        {...newData},
        {...toJSON(pencil) /* pencil was not modified */},
      ]);
    });

    // TODO(bajtos) to fully verify this functionality, we should create
    // a new test suite that will configure a PK with a different name
    // and type, e.g. `pk: string` instead of `id: number`.
    it('uses correct schema for the id parameter', async () => {
      const spec = app.restServer.getApiSpec();
      const findByIdOp = spec.paths['/products/{id}']['patch'];
      expect(findByIdOp).to.containDeep({
        parameters: [
          {
            name: 'id',
            in: 'path',
            schema: {type: 'number'},
          },
        ],
      });
    });
  });

  describe('deleteById', () => {
    beforeEach(seedData);

    it('deletes model with the given id', async () => {
      await client.del(`/products/${pen.id}`).expect(204);

      const stored = await repo.find();
      expect(toJSON(stored)).to.deepEqual(
        toJSON([
          /* pen was deleted */
          pencil,
        ]),
      );
    });

    // TODO(bajtos) to fully verify this functionality, we should create
    // a new test suite that will configure a PK with a different name
    // and type, e.g. `pk: string` instead of `id: number`.
    it('uses correct schema for the id parameter', async () => {
      const spec = app.restServer.getApiSpec();
      const findByIdOp = spec.paths['/products/{id}']['delete'];
      expect(findByIdOp).to.containDeep({
        parameters: [
          {
            name: 'id',
            in: 'path',
            schema: {type: 'number'},
          },
        ],
      });
    });
  });

  async function setupTestScenario() {
    const db = new juggler.DataSource({connector: 'memory'});

    const ProductRepository = defineCrudRepositoryClass(Product);

    repo = new ProductRepository(db);

    const CrudRestController = defineCrudRestController<
      Product,
      typeof Product.prototype.id,
      'id'
    >(Product, {basePath: '/products'});

    class ProductController extends CrudRestController {
      constructor() {
        super(repo);
      }
    }

    app = new RestApplication({rest: givenHttpServerConfig()});
    app.controller(ProductController);

    await app.start();
    client = createRestAppClient(app);
  }

  async function stopTheApp() {
    await app.stop();
  }

  async function cleanDatabase() {
    await repo.deleteAll();
    // Prevent accidental access to model instances created by previous tests
    (pen as unknown) = undefined;
    (pencil as unknown) = undefined;
  }

  async function seedData() {
    // It's important to make these calls in series, to ensure that "pen"
    // comes first when the results are sorted by `id` (the default order).
    pen = await repo.create({name: 'pen'});
    pencil = await repo.create({name: 'pencil'});
  }
});
