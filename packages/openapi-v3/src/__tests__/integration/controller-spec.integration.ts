// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, model, property} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {
  api,
  ControllerSpec,
  get,
  getControllerSpec,
  getModelSchemaRef,
  OperationObject,
  param,
  ParameterObject,
  post,
  requestBody,
  SchemaObject,
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
          Bar: {
            title: 'Bar',
            properties: {name: {type: 'string'}},
            additionalProperties: false,
          },
          Baz: {
            title: 'Baz',
            properties: {name: {type: 'string'}},
            additionalProperties: false,
          },
          Foo: {
            // guarantee `definition` is deleted
            title: 'Foo',
            properties: {
              bar: {$ref: '#/components/schemas/Bar'},
              baz: {$ref: '#/components/schemas/Baz'},
            },
            additionalProperties: false,
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

  context('reference models via spec', () => {
    it('allows operations to provide definitions of referenced models through #/components/schema', () => {
      class MyController {
        @get('/todos', {
          responses: {
            '200': {
              description: 'Array of Category model instances',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Todo',
                    definitions: {
                      Todo: {
                        title: 'Todo',
                        properties: {
                          title: {type: 'string'},
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        })
        async find(): Promise<object[]> {
          return []; // dummy implementation, it's never called
        }
      }

      const spec = getControllerSpec(MyController);
      const opSpec: OperationObject = spec.paths['/todos'].get;
      const responseSpec = opSpec.responses['200'].content['application/json'];
      expect(responseSpec.schema).to.deepEqual({
        $ref: '#/components/schemas/Todo',
      });

      const globalSchemas = (spec.components || {}).schemas;
      expect(globalSchemas).to.deepEqual({
        Todo: {
          title: 'Todo',
          properties: {
            title: {
              type: 'string',
            },
          },
        },
      });
    });

    it('allows operations to provide definitions of referenced models through #/definitions', () => {
      class MyController {
        @get('/todos', {
          responses: {
            '200': {
              description: 'Array of Category model instances',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/definitions/Todo',
                    definitions: {
                      Todo: {
                        title: 'Todo',
                        properties: {
                          title: {type: 'string'},
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        })
        async find(): Promise<object[]> {
          return []; // dummy implementation, it's never called
        }
      }

      const spec = getControllerSpec(MyController);
      const opSpec: OperationObject = spec.paths['/todos'].get;
      const responseSpec = opSpec.responses['200'].content['application/json'];
      expect(responseSpec.schema).to.deepEqual({
        $ref: '#/definitions/Todo',
      });

      const globalSchemas = (spec.components || {}).schemas;
      expect(globalSchemas).to.deepEqual({
        Todo: {
          title: 'Todo',
          properties: {
            title: {
              type: 'string',
            },
          },
        },
      });
    });

    it('allows operations to get definitions of models when defined through a different method', async () => {
      @model()
      class Todo extends Entity {
        @property({
          type: 'string',
          required: true,
        })
        title: string;
      }

      class MyController {
        @get('/todos', {
          responses: {
            '200': {
              description: 'Array of Category model instances',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/definitions/Todo',
                    definitions: {
                      Todo: {
                        title: 'Todo',
                        properties: {
                          title: {type: 'string'},
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        })
        async find(): Promise<object[]> {
          return []; // dummy implementation, it's never called
        }

        @get('/todos/{id}', {
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: {$ref: '#/components/schemas/Todo'},
                },
              },
            },
          },
        })
        async findById(): Promise<Todo> {
          return new Todo();
        }
      }

      const spec = getControllerSpec(MyController);
      const opSpec: OperationObject = spec.paths['/todos/{id}'].get;
      const responseSpec = opSpec.responses['200'].content['application/json'];
      expect(responseSpec.schema).to.deepEqual({
        $ref: '#/components/schemas/Todo',
      });

      const controller = new MyController();
      const todo = await controller.findById();
      expect(todo instanceof Todo).to.be.true();
    });

    it('returns undefined when it cannot find definition of referenced model', () => {
      class MyController {
        @get('/todos', {
          responses: {
            '200': {
              description: 'Array of Category model instances',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/definitions/Todo',
                  },
                },
              },
            },
          },
        })
        async find(): Promise<object[]> {
          return []; // dummy implementation, it's never called
        }
      }

      const spec = getControllerSpec(MyController);
      const globalSchemas = (spec.components || {}).schemas;
      expect(globalSchemas).to.be.undefined();
    });

    it('gets definition from outside the method decorator when it is not provided', () => {
      @api({
        paths: {},
        components: {
          schemas: {
            Todo: {
              title: 'Todo',
              properties: {
                title: {
                  type: 'string',
                },
              },
            },
          },
        },
      })
      class MyController {
        @get('/todos', {
          responses: {
            '200': {
              description: 'Array of Category model instances',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/definitions/Todo',
                  },
                },
              },
            },
          },
        })
        async find(): Promise<object[]> {
          return []; // dummy implementation, it's never called
        }
      }

      const spec = getControllerSpec(MyController);
      const opSpec: OperationObject = spec.paths['/todos'].get;
      const responseSpec = opSpec.responses['200'].content['application/json'];
      expect(responseSpec.schema).to.deepEqual({
        $ref: '#/definitions/Todo',
      });

      const globalSchemas = (spec.components || {}).schemas;
      expect(globalSchemas).to.deepEqual({
        Todo: {
          title: 'Todo',
          properties: {
            title: {
              type: 'string',
            },
          },
        },
      });
    });

    it('allows a class to reference schemas at @api level', () => {
      @api({
        paths: {
          '/todos': {
            get: {
              'x-operation-name': 'find',
              'x-controller-name': 'MyController',
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/Todo',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Todo: {
              title: 'Todo',
              properties: {
                title: {
                  type: 'string',
                },
              },
            },
          },
        },
      })
      class MyController {
        async find(): Promise<object[]> {
          return []; // dummy implementation, it's never called
        }
      }

      const spec = getControllerSpec(MyController);
      const opSpec: OperationObject = spec.paths['/todos'].get;
      const responseSpec = opSpec.responses['200'].content['application/json'];
      expect(responseSpec.schema).to.deepEqual({
        $ref: '#/components/schemas/Todo',
      });

      const globalSchemas = (spec.components || {}).schemas;
      expect(globalSchemas).to.deepEqual({
        Todo: {
          title: 'Todo',
          properties: {
            title: {
              type: 'string',
            },
          },
        },
      });
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
      additionalProperties: false,
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

  describe('getModelSchemaRef', () => {
    it('creates spec referencing shared model schema', () => {
      @model()
      class MyModel {
        @property()
        name: string;
      }

      class MyController {
        @get('/my', {
          responses: {
            '200': {
              description: 'Array of MyModel model instances',
              content: {
                'application/json': {
                  schema: getModelSchemaRef(MyModel),
                },
              },
            },
          },
        })
        async find(): Promise<MyModel[]> {
          return [];
        }
      }

      const spec = getControllerSpec(MyController);
      const opSpec: OperationObject = spec.paths['/my'].get;
      const responseSpec = opSpec.responses['200'].content['application/json'];
      expect(responseSpec.schema).to.deepEqual({
        $ref: '#/components/schemas/MyModel',
      });

      const globalSchemas = (spec.components || {}).schemas;
      expect(globalSchemas).to.deepEqual({
        MyModel: {
          title: 'MyModel',
          properties: {
            name: {
              type: 'string',
            },
          },
          additionalProperties: false,
        },
      });
    });
  });
});
