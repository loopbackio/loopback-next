// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {model, property} from '@loopback/repository';
import {ParameterObject} from '@loopback/openapi-v3-types';
import {param, requestBody, getControllerSpec, post, get} from '../../';

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
            'x-operation-name': 'create',
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

  it('generates schema from `x-ts-type`', () => {
    class MyController {
      @get('/', {
        responses: {
          '200': {
            description: 'hello world',
            content: {'application/json': {'x-ts-type': String}},
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
        content: {'application/json': {schema: {type: 'string'}}},
      },
    });
  });

  it('generates schema for an array from `x-ts-type`', () => {
    class MyController {
      @get('/', {
        responses: {
          '200': {
            description: 'hello world array',
            content: {
              'application/json': {
                schema: {type: 'array', items: {'x-ts-type': String}},
              },
            },
          },
        },
      })
      hello() {
        return ['hello', 'world'];
      }
    }

    const spec = getControllerSpec(MyController);
    expect(spec.paths['/'].get).to.have.property('responses');
    expect(spec.paths['/'].get.responses).to.eql({
      '200': {
        description: 'hello world array',
        content: {
          'application/json': {
            schema: {type: 'array', items: {type: 'string'}},
          },
        },
      },
    });
  });
});
