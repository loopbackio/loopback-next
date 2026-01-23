// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {model, Model, property} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {
  api,
  deprecated,
  get,
  getControllerSpec,
  getModelSchemaRef,
  OperationVisibility,
  param,
  post,
  requestBody,
  response,
  tags,
  visibility,
} from '../..';

describe('controller-spec advanced tests', () => {
  @model()
  class Product extends Model {
    @property()
    id: number;
    @property()
    name: string;
    @property()
    price: number;
  }

  @model()
  class Category extends Model {
    @property()
    id: number;
    @property()
    title: string;
  }

  describe('getModelSchemaRef', () => {
    it('generates schema reference for a model', () => {
      const schema = getModelSchemaRef(Product);
      expect(schema).to.have.property('$ref');
      expect(schema.$ref).to.equal('#/components/schemas/Product');
      expect(schema).to.have.property('definitions');
      expect(schema.definitions).to.have.property('Product');
    });

    it('generates schema reference with partial option', () => {
      const schema = getModelSchemaRef(Product, {partial: true});
      expect(schema).to.have.property('$ref');
      expect(schema.$ref).to.match(/ProductPartial/);
    });

    it('generates schema reference with exclude option', () => {
      const schema = getModelSchemaRef(Product, {exclude: ['id']});
      expect(schema).to.have.property('$ref');
      expect(schema.definitions).to.be.ok();
    });
  });

  describe('controller with multiple decorators', () => {
    it('combines class-level and method-level tags', () => {
      @tags('ClassTag1', 'ClassTag2')
      class TestController {
        @get('/test')
        @tags('MethodTag1')
        testMethod() {}
      }

      const spec = getControllerSpec(TestController);
      const operation = spec.paths['/test'].get;
      expect(operation.tags).to.eql(['ClassTag1', 'ClassTag2', 'MethodTag1']);
    });

    it('applies class-level deprecated to all methods', () => {
      @deprecated()
      class TestController {
        @get('/test1')
        method1() {}

        @post('/test2')
        method2() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/test1'].get.deprecated).to.be.true();
      expect(spec.paths['/test2'].post.deprecated).to.be.true();
    });

    it('applies class-level visibility to all methods', () => {
      @visibility(OperationVisibility.UNDOCUMENTED)
      class TestController {
        @get('/test1')
        method1() {}

        @get('/test2')
        method2() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/test1'].get['x-visibility']).to.equal('undocumented');
      expect(spec.paths['/test2'].get['x-visibility']).to.equal('undocumented');
    });

    it('method-level visibility overrides class-level', () => {
      @visibility(OperationVisibility.UNDOCUMENTED)
      class TestController {
        @get('/test')
        @visibility(OperationVisibility.DOCUMENTED)
        testMethod() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/test'].get['x-visibility']).to.equal('documented');
    });
  });

  describe('controller with complex responses', () => {
    it('handles multiple response decorators', () => {
      class TestController {
        @get('/products')
        @response(200, {
          description: 'Success',
          content: {
            'application/json': {
              schema: {type: 'array', items: getModelSchemaRef(Product)},
            },
          },
        })
        @response(404, {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {type: 'object', properties: {error: {type: 'string'}}},
            },
          },
        })
        getProducts() {}
      }

      const spec = getControllerSpec(TestController);
      const operation = spec.paths['/products'].get;
      expect(operation.responses).to.have.property('200');
      expect(operation.responses).to.have.property('404');
      expect(operation.responses['200'].description).to.equal('Success');
      expect(operation.responses['404'].description).to.equal('Not Found');
    });

    it('handles response with anyOf schema', () => {
      class TestController {
        @get('/items')
        @response(200, {
          description: 'Product or Category',
          content: {
            'application/json': {
              schema: {
                anyOf: [
                  getModelSchemaRef(Product),
                  getModelSchemaRef(Category),
                ],
              },
            },
          },
        })
        getItems() {}
      }

      const spec = getControllerSpec(TestController);
      const operation = spec.paths['/items'].get;
      const schema =
        operation.responses['200'].content['application/json'].schema;
      expect(schema).to.have.property('anyOf');
      expect(schema.anyOf).to.be.Array();
      expect(schema.anyOf).to.have.length(2);
    });
  });

  describe('controller with parameters', () => {
    it('handles path parameters correctly', () => {
      class TestController {
        @get('/products/{id}')
        getProduct(@param.path.number('id') id: number) {}
      }

      const spec = getControllerSpec(TestController);
      const operation = spec.paths['/products/{id}'].get;
      expect(operation.parameters).to.be.Array();
      expect(operation.parameters).to.have.length(1);
      expect(operation.parameters[0].name).to.equal('id');
      expect(operation.parameters[0].in).to.equal('path');
      expect(operation.parameters[0].required).to.be.true();
    });

    it('handles query parameters with schema', () => {
      class TestController {
        @get('/products')
        getProducts(
          @param.query.string('filter') filter?: string,
          @param.query.number('limit') limit?: number,
        ) {}
      }

      const spec = getControllerSpec(TestController);
      const operation = spec.paths['/products'].get;
      expect(operation.parameters).to.have.length(2);
      expect(operation.parameters[0].name).to.equal('filter');
      expect(operation.parameters[0].in).to.equal('query');
      expect(operation.parameters[1].name).to.equal('limit');
      expect(operation.parameters[1].schema?.type).to.equal('number');
    });

    it('handles sparse parameters with dependency injection', () => {
      class TestController {
        @get('/products')
        getProducts(
          // First param is injected, not a REST parameter
          injectedDep: string,
          @param.query.string('name') name: string,
        ) {}
      }

      const spec = getControllerSpec(TestController);
      const operation = spec.paths['/products'].get;
      // Should only have the REST parameter, not the injected one
      expect(operation.parameters).to.have.length(1);
      expect(operation.parameters[0].name).to.equal('name');
    });
  });

  describe('controller with operation metadata', () => {
    it('generates operationId from controller and method names', () => {
      class ProductController {
        @get('/products')
        findAll() {}
      }

      const spec = getControllerSpec(ProductController);
      const operation = spec.paths['/products'].get;
      expect(operation.operationId).to.equal('ProductController.findAll');
      expect(operation['x-operation-name']).to.equal('findAll');
      expect(operation['x-controller-name']).to.equal('ProductController');
    });
  });

  describe('controller with @api decorator', () => {
    it('uses spec from @api decorator', () => {
      @api({
        basePath: '/api',
        paths: {
          '/custom': {
            get: {
              responses: {
                '200': {description: 'Custom response'},
              },
            },
          },
        },
      })
      class TestController {}

      const spec = getControllerSpec(TestController);
      expect(spec.basePath).to.equal('/api');
      expect(spec.paths).to.have.property('/custom');
    });

    it('merges @api spec with method decorators', () => {
      @api({
        paths: {
          '/existing': {
            get: {
              responses: {'200': {description: 'Existing'}},
            },
          },
        },
      })
      class TestController {
        @get('/new')
        newMethod() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths).to.have.property('/existing');
      expect(spec.paths).to.have.property('/new');
    });
  });

  describe('controller with nested schemas', () => {
    it('handles nested model references', () => {
      @model()
      class Address extends Model {
        @property()
        street: string;
        @property()
        city: string;
      }

      @model()
      class User extends Model {
        @property()
        id: number;
        @property.array(Address)
        addresses: Address[];
      }

      class TestController {
        @post('/users')
        createUser(
          @requestBody({
            content: {
              'application/json': {
                schema: {'x-ts-type': User},
              },
            },
          })
          user: User,
        ) {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.components?.schemas).to.have.property('User');
      expect(spec.components?.schemas).to.have.property('Address');
    });
  });

  describe('edge cases', () => {
    it('handles controller with no methods', () => {
      class EmptyController {}

      const spec = getControllerSpec(EmptyController);
      expect(spec.paths).to.eql({});
    });

    it('handles method with no parameters', () => {
      class TestController {
        @get('/test')
        testMethod() {}
      }

      const spec = getControllerSpec(TestController);
      const operation = spec.paths['/test'].get;
      expect(operation.parameters).to.be.undefined();
    });

    it('caches controller spec', () => {
      class TestController {
        @get('/test')
        testMethod() {}
      }

      const spec1 = getControllerSpec(TestController);
      const spec2 = getControllerSpec(TestController);
      // Should return the same cached instance
      expect(spec1).to.equal(spec2);
    });
  });
});

// Made with Bob
