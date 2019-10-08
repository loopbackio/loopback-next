// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ControllerClass} from '@loopback/core';
import {model, property} from '@loopback/repository';
import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {
  api,
  getJsonSchema,
  jsonToSchemaObject,
  post,
  requestBody,
  RequestBodyValidationOptions,
  RestApplication,
  RestBindings,
  SchemaObject,
} from '../../..';
import {aBodySpec} from '../../helpers';

describe('Validation at REST level', () => {
  let app: RestApplication;
  let client: Client;

  @model()
  class Product {
    @property()
    id: number;

    @property({required: true})
    name: string;

    // NOTE(rfeng): We have to add `type: 'string'` to `@property` as
    // `string | null` removes TypeScript design:type reflection
    @property({required: false, type: 'string', jsonSchema: {nullable: true}})
    description?: string | null;

    @property({required: true, jsonSchema: {range: [0, 100]}})
    price: number;

    constructor(data: Partial<Product>) {
      Object.assign(this, data);
    }
  }

  const PRODUCT_SPEC: SchemaObject = jsonToSchemaObject(getJsonSchema(Product));

  // Add a schema that requires `description`
  const PRODUCT_SPEC_WITH_DESCRIPTION: SchemaObject = {
    ...PRODUCT_SPEC,
  };
  PRODUCT_SPEC_WITH_DESCRIPTION.required = PRODUCT_SPEC.required!.concat(
    'description',
  );

  context('with properties excluded from schema', () => {
    before(() => {
      const schema: SchemaObject = jsonToSchemaObject(
        getJsonSchema(Product, {exclude: ['id']}),
      );

      class ProductController {
        @post('/products')
        async create(
          @requestBody(aBodySpec(schema))
          data: object,
        ): Promise<Product> {
          return new Product(data);
        }
      }

      return givenAnAppAndAClient(ProductController);
    });
    after(() => app.stop());

    it('rejects request bodies containing excluded properties', async () => {
      const {body} = await client
        .post('/products')
        .type('json')
        .send({id: 1, name: 'a-product-name', price: 1})
        .expect(422);

      expect(body.error).to.containEql({
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

  // This is the standard use case that most LB4 applications should use.
  // The request body specification is inferred from a decorated model class.
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

    it('rejects requests with no body', async () => {
      // An empty body is now parsed as `undefined`
      await client
        .post('/products')
        .type('json')
        .expect(400);
    });

    it('rejects requests with empty json body', async () => {
      await client
        .post('/products')
        .type('json')
        .send('{}')
        .expect(422);
    });

    it('rejects requests with null body', async () => {
      await client
        .post('/products')
        .type('json')
        .send('null')
        .expect(400);
    });
  });

  context('with request body validation options', () => {
    class ProductController {
      @post('/products')
      async create(
        @requestBody({required: true}) data: Product,
      ): Promise<Product> {
        return new Product(data);
      }
    }

    before(() =>
      givenAnAppAndAClient(ProductController, {
        nullable: false,
        compiledSchemaCache: new WeakMap(),
        ajvKeywords: ['range'],
      }),
    );
    after(() => app.stop());

    it('rejects requests containing `null` with {nullable: false}', async () => {
      const DATA = {
        name: 'iPhone',
        description: null,
        price: 10,
      };
      const res = await client
        .post('/products')
        .send(DATA)
        .expect(422);

      expect(res.body).to.eql({
        error: {
          code: 'VALIDATION_FAILED',
          details: [
            {
              code: 'type',
              info: {
                type: 'string',
              },
              message: 'should be string',
              path: '.description',
            },
          ],
          message:
            'The request body is invalid. See error object `details` property for more info.',
          name: 'UnprocessableEntityError',
          statusCode: 422,
        },
      });
    });

    it('rejects requests with price out of range', async () => {
      const DATA = {
        name: 'iPhone',
        description: 'iPhone',
        price: 200,
      };
      const res = await client
        .post('/products')
        .send(DATA)
        .expect(422);

      expect(res.body).to.eql({
        error: {
          statusCode: 422,
          name: 'UnprocessableEntityError',
          message:
            'The request body is invalid. See error object `details` property for more info.',
          code: 'VALIDATION_FAILED',
          details: [
            {
              path: '.price',
              code: 'maximum',
              message: 'should be <= 100',
              info: {comparison: '<=', limit: 100, exclusive: false},
            },
            {
              path: '.price',
              code: 'range',
              message: 'should pass "range" keyword validation',
              info: {keyword: 'range'},
            },
          ],
        },
      });
    });
  });

  context('with request body validation options - {ajvKeywords: true}', () => {
    class ProductController {
      @post('/products')
      async create(
        @requestBody({required: true}) data: Product,
      ): Promise<Product> {
        return new Product(data);
      }
    }

    before(() =>
      givenAnAppAndAClient(ProductController, {
        nullable: false,
        compiledSchemaCache: new WeakMap(),
        $data: true,
        ajvKeywords: true,
      }),
    );
    after(() => app.stop());

    it('rejects requests with price out of range', async () => {
      const DATA = {
        name: 'iPhone',
        description: 'iPhone',
        price: 200,
      };
      const res = await client
        .post('/products')
        .send(DATA)
        .expect(422);

      expect(res.body).to.eql({
        error: {
          statusCode: 422,
          name: 'UnprocessableEntityError',
          message:
            'The request body is invalid. See error object `details` property for more info.',
          code: 'VALIDATION_FAILED',
          details: [
            {
              path: '.price',
              code: 'maximum',
              message: 'should be <= 100',
              info: {comparison: '<=', limit: 100, exclusive: false},
            },
            {
              path: '.price',
              code: 'range',
              message: 'should pass "range" keyword validation',
              info: {keyword: 'range'},
            },
          ],
        },
      });
    });
  });

  context(
    'with request body validation options - {ajvErrorTransformer: [Function]}',
    () => {
      class ProductController {
        @post('/products')
        async create(
          @requestBody({required: true}) data: Product,
        ): Promise<Product> {
          return new Product(data);
        }
      }

      before(() =>
        givenAnAppAndAClient(ProductController, {
          nullable: false,
          compiledSchemaCache: new WeakMap(),
          $data: true,
          ajvErrorTransformer: errors => {
            return errors.map(e => ({
              ...e,
              message: `(translated) ${e.message}`,
            }));
          },
        }),
      );
      after(() => app.stop());

      it('transforms error messages provided by AJV', async () => {
        const DATA = {
          name: 'iPhone',
          description: 'iPhone',
        };
        const res = await client
          .post('/products')
          .send(DATA)
          .expect(422);

        expect(res.body).to.eql({
          error: {
            statusCode: 422,
            name: 'UnprocessableEntityError',
            message:
              'The request body is invalid. See error object `details` property for more info.',
            code: 'VALIDATION_FAILED',
            details: [
              {
                path: '',
                code: 'required',
                message: "(translated) should have required property 'price'",
                info: {missingProperty: 'price'},
              },
            ],
          },
        });
      });
    },
  );

  // A request body schema can be provided explicitly by the user
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

  context('for different schemas per media type', () => {
    let spec = aBodySpec(PRODUCT_SPEC, {}, 'application/json');
    spec = aBodySpec(
      PRODUCT_SPEC_WITH_DESCRIPTION,
      spec,
      'application/x-www-form-urlencoded',
    );
    class ProductControllerWithFullSchema {
      @post('/products')
      async create(
        @requestBody(spec) data: object,
        //    ^^^^^^
        // use "object" instead of "Product" to verify the situation when
        // body schema cannot be inferred from the argument type
      ): Promise<Product> {
        return new Product(data);
      }
    }

    before(() => givenAnAppAndAClient(ProductControllerWithFullSchema));
    after(() => app.stop());

    it('accepts valid values for json', () => serverAcceptsValidRequestBody());

    it('accepts valid values for json with nullable properties', () =>
      serverAcceptsValidRequestBodyWithNull());

    it('accepts valid values for urlencoded', () =>
      serverAcceptsValidRequestBodyForUrlencoded());

    it('rejects missing required properties for urlencoded', () =>
      serverRejectsMissingDescriptionForUrlencoded());
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

  async function serverAcceptsValidRequestBodyWithNull() {
    const DATA = {
      name: 'Pencil',
      description: null,
      price: 10,
    };
    await client
      .post('/products')
      .send(DATA)
      .expect(200, DATA);
  }

  async function serverAcceptsValidRequestBodyForUrlencoded() {
    const DATA =
      'name=Pencil&price=10&description=An optional description of a pencil';
    await client
      .post('/products')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send(DATA)
      .expect(200, {
        name: 'Pencil',
        description: 'An optional description of a pencil',
        price: 10,
      });
  }

  async function serverRejectsMissingDescriptionForUrlencoded() {
    const DATA = 'name=Pencil&price=10';
    await client
      .post('/products')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send(DATA)
      .expect(422);
  }

  async function serverRejectsRequestWithMissingRequiredValues() {
    await client
      .post('/products')
      .send({
        description: 'A product missing required name and price',
      })
      .expect(422);
  }

  async function givenAnAppAndAClient(
    controller: ControllerClass,
    validationOptions?: RequestBodyValidationOptions,
  ) {
    app = new RestApplication({rest: givenHttpServerConfig()});
    if (validationOptions)
      app
        .bind(RestBindings.REQUEST_BODY_PARSER_OPTIONS)
        .to({validation: validationOptions});
    app.controller(controller);
    await app.start();

    client = createRestAppClient(app);
  }
});
