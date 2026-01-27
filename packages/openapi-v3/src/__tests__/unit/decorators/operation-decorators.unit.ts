// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  del,
  get,
  getControllerSpec,
  operation,
  patch,
  post,
  put,
} from '../../..';

describe('operation decorators', () => {
  describe('@get', () => {
    it('defines GET operation', () => {
      class TestController {
        @get('/products')
        getProducts() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/products']).to.have.property('get');
      expect(spec.paths['/products'].get).to.be.ok();
    });

    it('defines GET operation with spec', () => {
      class TestController {
        @get('/products/{id}', {
          responses: {
            '200': {
              description: 'Product found',
            },
          },
        })
        getProduct() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/products/{id}'].get.responses).to.have.property(
        '200',
      );
      expect(
        spec.paths['/products/{id}'].get.responses['200'].description,
      ).to.equal('Product found');
    });

    it('defines multiple GET operations', () => {
      class TestController {
        @get('/products')
        getAll() {}

        @get('/products/{id}')
        getById() {}

        @get('/products/count')
        count() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/products']).to.have.property('get');
      expect(spec.paths['/products/{id}']).to.have.property('get');
      expect(spec.paths['/products/count']).to.have.property('get');
    });
  });

  describe('@post', () => {
    it('defines POST operation', () => {
      class TestController {
        @post('/products')
        createProduct() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/products']).to.have.property('post');
    });

    it('defines POST operation with spec', () => {
      class TestController {
        @post('/products', {
          responses: {
            '201': {
              description: 'Product created',
            },
          },
        })
        createProduct() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/products'].post.responses).to.have.property('201');
    });

    it('defines POST with requestBody in spec', () => {
      class TestController {
        @post('/products', {
          requestBody: {
            content: {
              'application/json': {
                schema: {type: 'object'},
              },
            },
          },
          responses: {
            '201': {description: 'Created'},
          },
        })
        createProduct() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/products'].post).to.have.property('requestBody');
    });
  });

  describe('@put', () => {
    it('defines PUT operation', () => {
      class TestController {
        @put('/products/{id}')
        replaceProduct() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/products/{id}']).to.have.property('put');
    });

    it('defines PUT operation with spec', () => {
      class TestController {
        @put('/products/{id}', {
          responses: {
            '204': {
              description: 'Product replaced',
            },
          },
        })
        replaceProduct() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/products/{id}'].put.responses).to.have.property(
        '204',
      );
    });
  });

  describe('@patch', () => {
    it('defines PATCH operation', () => {
      class TestController {
        @patch('/products/{id}')
        updateProduct() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/products/{id}']).to.have.property('patch');
    });

    it('defines PATCH operation with spec', () => {
      class TestController {
        @patch('/products/{id}', {
          responses: {
            '204': {
              description: 'Product updated',
            },
          },
        })
        updateProduct() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/products/{id}'].patch.responses).to.have.property(
        '204',
      );
    });

    it('defines PATCH for bulk update', () => {
      class TestController {
        @patch('/products', {
          responses: {
            '200': {
              description: 'Products updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      count: {type: 'number'},
                    },
                  },
                },
              },
            },
          },
        })
        updateAll() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/products'].patch).to.be.ok();
    });
  });

  describe('@del', () => {
    it('defines DELETE operation', () => {
      class TestController {
        @del('/products/{id}')
        deleteProduct() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/products/{id}']).to.have.property('delete');
    });

    it('defines DELETE operation with spec', () => {
      class TestController {
        @del('/products/{id}', {
          responses: {
            '204': {
              description: 'Product deleted',
            },
          },
        })
        deleteProduct() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/products/{id}'].delete.responses).to.have.property(
        '204',
      );
    });

    it('defines DELETE for bulk deletion', () => {
      class TestController {
        @del('/products', {
          responses: {
            '200': {
              description: 'Products deleted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      count: {type: 'number'},
                    },
                  },
                },
              },
            },
          },
        })
        deleteAll() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/products'].delete).to.be.ok();
    });
  });

  describe('@operation', () => {
    it('defines custom HTTP verb operation', () => {
      class TestController {
        @operation('head', '/products')
        headProducts() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/products']).to.have.property('head');
    });

    it('defines OPTIONS operation', () => {
      class TestController {
        @operation('options', '/products')
        optionsProducts() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/products']).to.have.property('options');
    });

    it('defines operation with full spec', () => {
      class TestController {
        @operation('get', '/custom', {
          summary: 'Custom operation',
          description: 'A custom GET operation',
          operationId: 'customOp',
          responses: {
            '200': {
              description: 'Success',
            },
          },
          tags: ['custom'],
        })
        customOperation() {}
      }

      const spec = getControllerSpec(TestController);
      const op = spec.paths['/custom'].get;
      expect(op.summary).to.equal('Custom operation');
      expect(op.description).to.equal('A custom GET operation');
      expect(op.operationId).to.equal('customOp');
      expect(op.tags).to.eql(['custom']);
    });
  });

  describe('multiple operations on same path', () => {
    it('defines multiple HTTP verbs for same path', () => {
      class TestController {
        @get('/products')
        getProducts() {}

        @post('/products')
        createProduct() {}

        @patch('/products')
        updateProducts() {}

        @del('/products')
        deleteProducts() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/products']).to.have.property('get');
      expect(spec.paths['/products']).to.have.property('post');
      expect(spec.paths['/products']).to.have.property('patch');
      expect(spec.paths['/products']).to.have.property('delete');
    });

    it('defines CRUD operations for resource', () => {
      class TestController {
        @get('/products')
        find() {}

        @get('/products/{id}')
        findById() {}

        @post('/products')
        create() {}

        @put('/products/{id}')
        replaceById() {}

        @patch('/products/{id}')
        updateById() {}

        @del('/products/{id}')
        deleteById() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/products'].get).to.be.ok();
      expect(spec.paths['/products'].post).to.be.ok();
      expect(spec.paths['/products/{id}'].get).to.be.ok();
      expect(spec.paths['/products/{id}'].put).to.be.ok();
      expect(spec.paths['/products/{id}'].patch).to.be.ok();
      expect(spec.paths['/products/{id}'].delete).to.be.ok();
    });
  });

  describe('operation metadata', () => {
    it('generates x-operation-name from method name', () => {
      class TestController {
        @get('/products')
        findAllProducts() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/products'].get['x-operation-name']).to.equal(
        'findAllProducts',
      );
    });

    it('generates x-controller-name from class name', () => {
      class ProductController {
        @get('/products')
        find() {}
      }

      const spec = getControllerSpec(ProductController);
      expect(spec.paths['/products'].get['x-controller-name']).to.equal(
        'ProductController',
      );
    });

    it('generates operationId from controller and method names', () => {
      class ProductController {
        @get('/products')
        findAll() {}
      }

      const spec = getControllerSpec(ProductController);
      expect(spec.paths['/products'].get.operationId).to.equal(
        'ProductController.findAll',
      );
    });

    it('preserves custom operationId', () => {
      class TestController {
        @get('/products', {
          operationId: 'listProducts',
          responses: {},
        })
        find() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/products'].get.operationId).to.equal('listProducts');
    });
  });

  describe('operation with empty spec', () => {
    it('generates default response for operation without spec', () => {
      class TestController {
        @get('/test')
        testMethod() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/test'].get.responses).to.have.property('200');
    });

    it('allows undefined spec parameter', () => {
      class TestController {
        @get('/test', undefined)
        testMethod() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/test'].get).to.be.ok();
    });
  });

  describe('path parameters in operation', () => {
    it('handles single path parameter', () => {
      class TestController {
        @get('/products/{id}')
        getById() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths).to.have.property('/products/{id}');
    });

    it('handles multiple path parameters', () => {
      class TestController {
        @get('/categories/{categoryId}/products/{productId}')
        getProduct() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths).to.have.property(
        '/categories/{categoryId}/products/{productId}',
      );
    });

    it('handles path with query-like syntax', () => {
      class TestController {
        @get('/search')
        search() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths).to.have.property('/search');
    });
  });

  describe('operation with security', () => {
    it('defines operation with security requirement', () => {
      class TestController {
        @get('/protected', {
          security: [{bearerAuth: []}],
          responses: {
            '200': {description: 'Success'},
          },
        })
        protectedEndpoint() {}
      }

      const spec = getControllerSpec(TestController);
      expect(spec.paths['/protected'].get).to.have.property('security');
      expect(spec.paths['/protected'].get.security).to.eql([{bearerAuth: []}]);
    });
  });
});

// Made with Bob
