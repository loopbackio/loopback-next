// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ParameterObject, SchemaObject} from '@loopback/openapi-v3-types';
import {model, property} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {
  ControllerSpec,
  get,
  getControllerSpec,
  param,
  post,
  requestBody,
} from '../..';

describe('controller spec', () => {
  it('adds property schemas in components.schemas', () => {
    @model()
    class Bar {
      @property()
      name: string;
    }

    @model()
    class Baz {
      @property()
      name: string;
    }

    @model()
    class Foo {
      @property()
      bar: Bar;
      @property()
      baz: Baz;
    }

    class FooController {
      @post('/foo')
      create(
        @requestBody({description: 'a foo instance', required: true}) foo: Foo,
      ): void {}
    }

    const expectedSpec = {
      paths: {
        '/foo': {
          post: {
            responses: {
              '200': {
                description: 'Return value of FooController.create',
              },
            },
            requestBody: {
              description: 'a foo instance',
              required: true,
              content: {
                'application/json': {
                  schema: {$ref: '#/components/schemas/Foo'},
                },
              },
            },
            'x-controller-name': 'FooController',
            'x-operation-name': 'create',
            operationId: 'FooController.create',
          },
        },
      },
      components: {
        schemas: {
          Bar: {title: 'Bar', properties: {name: {type: 'string'}}},
          Baz: {title: 'Baz', properties: {name: {type: 'string'}}},
          Foo: {
            // guarantee `definition` is deleted
            title: 'Foo',
            properties: {
              bar: {$ref: '#/components/schemas/Bar'},
              baz: {$ref: '#/components/schemas/Baz'},
            },
          },
        },
      },
    };

    expect(getControllerSpec(FooController)).to.eql(expectedSpec);
  });

  it('does not produce nested definitions', () => {
    const paramSpec: ParameterObject = {
      name: 'foo',
      in: 'query',
    };

    @model()
    class Foo {
      @property()
      bar: number;
    }

    @model()
    class MyParam {
      @property()
      name: string;
      @property()
      foo: Foo;
    }

    class MyController {
      @post('/foo')
      foo(@param(paramSpec) body: MyParam) {}
    }

    const components = getControllerSpec(MyController).components!;
    const schemas = components.schemas;

    expect(schemas).to.have.keys('MyParam', 'Foo');
    expect(schemas!.MyParam).to.not.have.key('definitions');
  });

  it('infers no properties if no property metadata is present', () => {
    const paramSpec: ParameterObject = {
      name: 'foo',
      in: 'query',
    };

    @model()
    class MyParam {
      name: string;
    }

    class MyController {
      @post('/foo')
      foo(@param(paramSpec) foo: MyParam) {}
    }

    const components = getControllerSpec(MyController).components!;
    const schemas = components.schemas;

    expect(schemas).to.have.key('MyParam');
    expect(schemas!.MyParam).to.not.have.key('properties');
  });

  it('does not infer definition if no class metadata is present', () => {
    const paramSpec: ParameterObject = {
      name: 'foo',
      in: 'query',
    };
    class MyParam {
      @property()
      name: string;
    }
    class MyController {
      @post('/foo')
      foo(@param(paramSpec) foo: MyParam) {}
    }

    const components = getControllerSpec(MyController).components!;
    const schemas = components.schemas;

    expect(schemas).to.have.key('MyParam');
    expect(schemas!.MyParam).to.deepEqual({});
  });

  it('generates a default responses object if not set', () => {
    class MyController {
      @get('/')
      hello() {
        return 'hello world';
      }
    }

    const spec = getControllerSpec(MyController);
    expect(spec.paths['/'].get).to.have.property('responses');
    expect(spec.paths['/'].get.responses).to.eql({
      '200': {
        description: 'Return value of MyController.hello',
      },
    });
  });

  it('generates a response given no content property', () => {
    class MyController {
      @get('/', {
        responses: {
          '200': {
            description: 'hello world',
          },
        },
      })
      hello() {
        return 'hello world';
      }
    }

    const spec = getControllerSpec(MyController);
    expect(spec.paths['/'].get).to.have.property('responses');
    expect(spec.paths['/'].get.responses).to.eql({
      '200': {
        description: 'hello world',
      },
    });
  });

  describe('x-ts-type', () => {
    @model()
    class MyModel {
      @property()
      name: string;
    }

    const myModelSchema = {
      properties: {
        name: {
          type: 'string',
        },
      },
      title: 'MyModel',
    };

    it('generates schema for response content', () => {
      const controllerClass = givenControllerWithResponseSchema({
        'x-ts-type': String,
      });
      const spec = getControllerSpec(controllerClass);
      expect(spec.paths['/'].get).to.have.property('responses');
      expect(spec.paths['/'].get.responses).to.eql({
        '200': {
          description: 'hello world',
          content: {'application/json': {schema: {type: 'string'}}},
        },
      });
    });

    it('generates schema for a model in response', () => {
      const controllerClass = givenControllerWithResponseSchema({
        'x-ts-type': MyModel,
      });
      const spec = getControllerSpec(controllerClass);
      expect(spec.paths['/'].get).to.have.property('responses');
      expect(spec.paths['/'].get.responses).to.eql({
        '200': {
          description: 'hello world',
          content: {
            'application/json': {
              schema: {$ref: '#/components/schemas/MyModel'},
            },
          },
        },
      });
      assertMyModelSchemaInSpec(spec);
    });

    it('generates schema for an array in response', () => {
      const controllerClass = givenControllerWithResponseSchema({
        type: 'array',
        items: {'x-ts-type': String},
      });

      const spec = getControllerSpec(controllerClass);
      expect(spec.paths['/'].get).to.have.property('responses');
      expect(spec.paths['/'].get.responses).to.eql({
        '200': {
          description: 'hello world',
          content: {
            'application/json': {
              schema: {type: 'array', items: {type: 'string'}},
            },
          },
        },
      });
    });

    it('generates schema for a model array in response', () => {
      const controllerClass = givenControllerWithResponseSchema({
        type: 'array',
        items: {'x-ts-type': MyModel},
      });

      const spec = getControllerSpec(controllerClass);
      expect(spec.paths['/'].get).to.have.property('responses');
      expect(spec.paths['/'].get.responses).to.eql({
        '200': {
          description: 'hello world',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {$ref: '#/components/schemas/MyModel'},
              },
            },
          },
        },
      });
      assertMyModelSchemaInSpec(spec);
    });

    it('generates schema for a nesting model array in response', () => {
      const controllerClass = givenControllerWithResponseSchema({
        type: 'array',
        items: {
          type: 'array',
          items: {
            'x-ts-type': MyModel,
          },
        },
      });

      const spec = getControllerSpec(controllerClass);
      expect(spec.paths['/'].get).to.have.property('responses');
      expect(spec.paths['/'].get.responses).to.eql({
        '200': {
          description: 'hello world',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'array',
                  items: {$ref: '#/components/schemas/MyModel'},
                },
              },
            },
          },
        },
      });
      assertMyModelSchemaInSpec(spec);
    });

    it('generates schema for a model property in response', () => {
      const controllerClass = givenControllerWithResponseSchema({
        type: 'object',
        properties: {
          myModel: {
            'x-ts-type': MyModel,
          },
        },
      });

      const spec = getControllerSpec(controllerClass);
      expect(spec.paths['/'].get).to.have.property('responses');
      expect(spec.paths['/'].get.responses).to.eql({
        '200': {
          description: 'hello world',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {myModel: {$ref: '#/components/schemas/MyModel'}},
              },
            },
          },
        },
      });
      assertMyModelSchemaInSpec(spec);
    });

    it('generates schema for a type in request', () => {
      const controllerClass = givenControllerWithRequestSchema({
        'x-ts-type': String,
      });

      const spec = getControllerSpec(controllerClass);
      expect(spec.paths['/'].post).to.have.property('requestBody');
      expect(spec.paths['/'].post.requestBody).to.eql({
        content: {
          'application/json': {schema: {type: 'string'}},
        },
      });
    });

    it('generates schema for a model in request', () => {
      const controllerClass = givenControllerWithRequestSchema({
        'x-ts-type': MyModel,
      });

      const spec = getControllerSpec(controllerClass);
      expect(spec.paths['/'].post).to.have.property('requestBody');
      expect(spec.paths['/'].post.requestBody).to.eql({
        content: {
          'application/json': {schema: {$ref: '#/components/schemas/MyModel'}},
        },
      });
      assertMyModelSchemaInSpec(spec);
    });

    function assertMyModelSchemaInSpec(spec: ControllerSpec) {
      expect(spec.components).to.eql({schemas: {MyModel: myModelSchema}});
    }

    function givenControllerWithResponseSchema(schema: SchemaObject) {
      class MyController {
        @get('/', {
          responses: {
            '200': {
              description: 'hello world',
              content: {'application/json': {schema}},
            },
          },
        })
        hello() {
          return 'hello world';
        }
      }
      return MyController;
    }

    function givenControllerWithRequestSchema(schema: SchemaObject) {
      class MyController {
        @post('/')
        hello(
          @requestBody({
            content: {'application/json': {schema}},
          })
          body: MyModel,
        ) {
          return `hello ${body.name}`;
        }
      }
      return MyController;
    }
  });
});
