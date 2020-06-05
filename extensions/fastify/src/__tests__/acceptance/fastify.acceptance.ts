// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/fastify
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, Constructor} from '@loopback/core';
import {
  DefaultCrudRepository,
  Entity,
  juggler,
  model,
  property,
  RepositoryMixin,
} from '@loopback/repository';
import {CrudRestApiBuilder} from '@loopback/rest-crud';
import {
  expect,
  givenHttpServerConfig,
  supertest,
  toJSON,
} from '@loopback/testlab';
import {FastifyMixin, get, param, post, requestBody} from '../..';

describe('@loopback/fastify (acceptance)', () => {
  let app: FastifyApplication;
  afterEach(() => app?.stop());

  it('supports parameter-less GET controller methods', async () => {
    class TestController {
      @get('/ping')
      ping() {
        return {success: true};
      }
    }
    await givenRunningAppWithController(TestController);
    await supertest(app.url)
      .get('/ping')
      .expect(200)
      .expect('content-type', /^application\/json/)
      .expect({success: true});
  });

  it('parses and coerces parameters from URL path', async () => {
    class TestController {
      @get('/dump/{id}')
      dump(
        @param.path.number('id')
        id: number,
      ) {
        return {id};
      }
    }
    await givenRunningAppWithController(TestController);

    await supertest(app.url).get('/dump/123').expect(200).expect({id: 123});
  });

  // TODO: test invalid value for a path parameter (e.g. string vs number)

  it('parses and coerces parameters from request headers', async () => {
    class TestController {
      @get('/dump')
      dump(
        @param.header.number('x-key')
        key: number,
      ) {
        return {key};
      }
    }
    await givenRunningAppWithController(TestController);

    await supertest(app.url)
      .get('/dump')
      .set('x-key', '123')
      .expect(200)
      .expect({key: 123});
  });

  // TODO: test missing value for a required header parameter
  // TODO: test invalid value for a header parameter (e.g. string vs number)

  it('parses and coerces parameters from query string (deep-object)', async () => {
    class TestController {
      @get('/dump')
      dump(
        @param.query.object('data', {
          properties: {
            count: {type: 'number'},
            expand: {type: 'boolean'},
          },
        })
        data: {
          count?: number;
          expand?: boolean;
        },
      ) {
        return {data};
      }
    }
    await givenRunningAppWithController(TestController);

    await supertest(app.url)
      .get('/dump')
      .query('data[count]=10&data[expand]=true')
      .expect(200)
      .expect({data: {count: 10, expand: true}});
  });

  it('parses and coerces parameters from query string (JSON encoded)', async () => {
    class TestController {
      @get('/dump')
      dump(
        @param.query.object('data', {
          properties: {
            count: {type: 'number'},
            expand: {type: 'boolean'},
          },
        })
        data: {
          count?: number;
          expand?: boolean;
        },
      ) {
        return {data};
      }
    }
    await givenRunningAppWithController(TestController);

    await supertest(app.url)
      .get('/dump')
      .query('data={"count":10,"expand":true}')
      .expect(200)
      .expect({data: {count: 10, expand: true}});
  });

  // TODO: test missing value for a required query-string parameter
  // TODO: test invalid value for a query-string parameter (not matching schema)

  it('parses and coerces parameters from request body (JSON)', async () => {
    class TestController {
      @post('/dump')
      dump(
        @requestBody({
          content: {
            'application/json': {
              schema: {
                properties: {
                  count: {type: 'number'},
                  expand: {type: 'boolean'},
                },
              },
            },
          },
        })
        data: {
          count?: number;
          expand?: boolean;
        },
      ) {
        return {data};
      }
    }
    await givenRunningAppWithController(TestController);

    await supertest(app.url)
      .post('/dump')
      .send({count: 10, expand: true})
      .expect(200)
      .expect({data: {count: 10, expand: true}});
  });

  // TODO: test invalid value for request-body argument

  describe('rest-crud', () => {
    type ProductRepository = DefaultCrudRepository<
      Product,
      typeof Product.prototype.id,
      {}
    >;
    let productRepository: ProductRepository;

    beforeEach(givenAppWithProductRestCrudApi);

    describe('GET /products', () => {
      it('returns existing products', async () => {
        const product = await givenProductInstance();
        await supertest(app.url)
          .get('/products')
          .expect(200)
          .expect('content-type', /^application\/json/)
          .expect([toJSON(product)]);
      });

      // TODO: find with filter
    });

    describe('POST /products', () => {
      it('creates a new product using data from request body', async () => {
        const expectedData = {
          id: 1,
          name: 'Pen',
          description: 'A roller-ball pen for home and office.',
        };
        await supertest(app.url)
          .post('/products')
          .type('json')
          .send({
            name: 'Pen',
            description: 'A roller-ball pen for home and office.',
          })
          .expect(200)
          .expect(expectedData);

        const created = await productRepository.find();
        expect(created).to.deepEqual([new Product(expectedData)]);
      });

      // TODO: send empty body, expect 422 Unprocessable Entity
    });

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

    let counter = 1;
    function givenProductInstance(data?: Partial<Product>) {
      return productRepository.create({
        name: `a-product-${counter++}`,
        ...data,
      });
    }
    async function givenAppWithProductRestCrudApi() {
      app = new FastifyApplication();
      app.dataSource(
        new juggler.DataSource({
          name: 'db',
          connector: 'memory',
        }),
      );

      await new CrudRestApiBuilder().build(app, Product, {
        model: Product,
        dataSource: 'db',
        pattern: 'CrudRest',
        basePath: '/products',
      });

      productRepository = await app.get<ProductRepository>(
        'repositories.ProductRepository',
      );

      await app.start();
    }
  });

  function givenRunningAppWithController(controllerCtor: Constructor<unknown>) {
    app = new FastifyApplication();
    app.controller(controllerCtor);
    return app.start();
  }

  class FastifyApplication extends FastifyMixin(RepositoryMixin(Application)) {
    constructor() {
      super({
        fastify: givenHttpServerConfig(),
      });
    }
  }
});
