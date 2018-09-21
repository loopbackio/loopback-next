// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ControllerClass} from '@loopback/core';
import {model, property} from '@loopback/repository';
import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {
  api,
  getJsonSchema,
  jsonToSchemaObject,
  post,
  requestBody,
  RestApplication,
} from '../../..';
import {aBodySpec} from '../../helpers';

describe('Validation at REST level', () => {
  let app: RestApplication;
  let client: Client;

  @model()
  class Product {
    @property({required: true})
    name: string;

    @property({required: false})
    description?: string;

    @property({required: true})
    price: number;

    constructor(data: Partial<Product>) {
      Object.assign(this, data);
    }
  }

  const PRODUCT_SPEC = jsonToSchemaObject(getJsonSchema(Product));

  // This is the standard use case that most LB4 applications should use.
  // The request body specification is infered from a decorated model class.
  context('for request body specified via model definition', () => {
    class ProductController {
      @post('/products')
      async create(
        @requestBody({required: true}) data: Product,
      ): Promise<Product> {
        return new Product(data);
      }
    }

    before(() => givenAnAppAndAClient(ProductController));
    after(() => app.stop());

    it('accepts valid values', () => serverAcceptsValidRequestBody());

    it('rejects missing required properties', () =>
      serverRejectsRequestWithMissingRequiredValues());

    it('rejects requests with no (empty) body', async () => {
      // NOTE(bajtos) An empty body cannot be parsed as a JSON,
      // therefore this test request does not even reach the validation logic.
      await client.post('/products').expect(400);
    });

    it('rejects requests with null body', async () => {
      await client
        .post('/products')
        .type('json')
        .send('null')
        .expect(400);
    });
  });

  // A request body schema can be provied explicitly by the user
  // as an inlined content[type].schema property.
  context('for fully-specified request body', () => {
    class ProductControllerWithFullSchema {
      @post('/products')
      async create(
        @requestBody(aBodySpec(PRODUCT_SPEC)) data: object,
        //    ^^^^^^
        // use "object" instead of "Product" to verify the situation when
        // body schema cannot be inferred from the argument type
      ): Promise<Product> {
        return new Product(data);
      }
    }

    before(() => givenAnAppAndAClient(ProductControllerWithFullSchema));
    after(() => app.stop());

    it('accepts valid values', () => serverAcceptsValidRequestBody());

    it('rejects missing required properties', () =>
      serverRejectsRequestWithMissingRequiredValues());
  });

  // A request body schema can be provided explicitly by the user as a reference
  // to a schema shared in the global `components.schemas` object.
  context('for request body specified via a reference', () => {
    @api({
      paths: {},
      components: {
        schemas: {
          Product: PRODUCT_SPEC,
        },
      },
    })
    class ProductControllerReferencingComponents {
      @post('/products')
      async create(
        @requestBody(aBodySpec({$ref: '#/components/schemas/Product'}))
        data: object,
        //    ^^^^^^
        // use "object" instead of "Product" to verify the situation when
        // body schema cannot be inferred from the argument type
      ): Promise<Product> {
        return new Product(data);
      }
    }

    before(() => givenAnAppAndAClient(ProductControllerReferencingComponents));
    after(() => app.stop());

    it('accepts valid values', () => serverAcceptsValidRequestBody());

    it('rejects missing required properties', () =>
      serverRejectsRequestWithMissingRequiredValues());
  });

  async function serverAcceptsValidRequestBody() {
    const DATA = {
      name: 'Pencil',
      description: 'An optional description of a pencil',
      price: 10,
    };
    await client
      .post('/products')
      .send(DATA)
      .expect(200, DATA);
  }

  async function serverRejectsRequestWithMissingRequiredValues() {
    await client
      .post('/products')
      .send({
        description: 'A product missing required name and price',
      })
      .expect(422);
  }

  async function givenAnAppAndAClient(controller: ControllerClass) {
    app = new RestApplication({rest: givenHttpServerConfig()});
    app.controller(controller);
    await app.start();

    client = createRestAppClient(app);
  }
});
