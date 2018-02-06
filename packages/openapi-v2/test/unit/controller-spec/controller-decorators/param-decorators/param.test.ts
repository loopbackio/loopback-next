// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v2
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  get,
  param,
  getControllerSpec,
  operation,
  patch,
  post,
} from '../../../../..';
import {
  OperationObject,
  ParameterObject,
  ResponsesObject,
  DefinitionsObject,
} from '@loopback/openapi-spec';
import {expect} from '@loopback/testlab';
import {anOperationSpec} from '@loopback/openapi-spec-builder';
import * as stream from 'stream';
import {model, property} from '@loopback/repository';

describe('Routing metadata for parameters', () => {
  describe('@param', () => {
    it('defines a new parameter', () => {
      const paramSpec: ParameterObject = {
        name: 'name',
        type: 'string',
        in: 'query',
      };

      class MyController {
        @get('/greet')
        @param(paramSpec)
        greet(name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      const expectedSpec = anOperationSpec()
        .withOperationName('greet')
        .withParameter(paramSpec)
        .build();

      expect(actualSpec.paths['/greet']['get']).to.eql(expectedSpec);
    });

    it('infers non-body parameter type', () => {
      class MyController {
        @patch('/update/{id}')
        update(
          @param({
            name: 'id',
            in: 'path',
          })
          id: string,
          @param({
            name: 'name',
            in: 'query',
          })
          name: string,
          @param({
            name: 'age',
            in: 'query',
          })
          age: number,
          @param({
            name: 'vip',
            in: 'query',
          })
          vip: boolean,
          @param.array('tags', 'query', {type: 'string'})
          tags: string[],
          @param({
            name: 'picture',
            in: 'body',
          })
          picture: stream.Readable,
        ) {}
      }

      const actualSpec = getControllerSpec(MyController);

      const expectedSpec = anOperationSpec()
        .withOperationName('update')
        .withParameter({
          name: 'id',
          type: 'string',
          in: 'path',
        })
        .withParameter({
          name: 'name',
          type: 'string',
          in: 'query',
        })
        .withParameter({
          name: 'age',
          type: 'number',
          in: 'query',
        })
        .withParameter({
          name: 'vip',
          type: 'boolean',
          in: 'query',
        })
        .withParameter({
          name: 'tags',
          type: 'array',
          items: {
            type: 'string',
          },
          in: 'query',
        })
        .withParameter({
          name: 'picture',
          schema: {
            type: 'file',
          },
          in: 'body',
        })
        .build();

      expect(actualSpec.paths['/update/{id}']['patch']).to.eql(expectedSpec);
    });

    it('infers array non-body parameter type', () => {
      class MyController {
        @get('/greet')
        greet(
          @param.array('names', 'query', 'string')
          names: string[],
        ) {}
      }

      const actualSpec = getControllerSpec(MyController);

      const expectedSpec = anOperationSpec()
        .withOperationName('greet')
        .withParameter({
          name: 'names',
          type: 'array',
          items: {
            type: 'string',
          },
          in: 'query',
        })
        .build();

      expect(actualSpec.paths['/greet']['get']).to.eql(expectedSpec);
    });

    it('infers array non-body parameter type without explict type', () => {
      class MyController {
        @get('/greet')
        greet(
          @param({name: 'names', in: 'query', items: {type: 'string'}})
          names: string[],
        ) {}
      }

      const actualSpec = getControllerSpec(MyController);

      const expectedSpec = anOperationSpec()
        .withOperationName('greet')
        .withParameter({
          name: 'names',
          type: 'array',
          items: {
            type: 'string',
          },
          in: 'query',
        })
        .build();

      expect(actualSpec.paths['/greet']['get']).to.eql(expectedSpec);
    });

    it('reports error if an array parameter type is not Array', () => {
      expect.throws(
        () => {
          // tslint:disable-next-line:no-unused-variable
          class MyController {
            @get('/greet')
            greet(
              @param.array('names', 'query', 'string')
              names: string,
            ) {}
          }
        },
        Error,
        `The parameter type is set to 'array' but the JavaScript type is String`,
      );
    });

    it('infers array parameter type with `any`', () => {
      class MyController {
        @get('/greet')
        greet(
          @param.array('names', 'query', 'string')
          names: /* tslint:disable-next-line:no-any */
          any,
        ) {}
      }

      const actualSpec = getControllerSpec(MyController);

      const expectedSpec = anOperationSpec()
        .withOperationName('greet')
        .withParameter({
          name: 'names',
          type: 'array',
          items: {
            type: 'string',
          },
          in: 'query',
        })
        .build();

      expect(actualSpec.paths['/greet']['get']).to.eql(expectedSpec);
    });

    it('infers simple body parameter type', () => {
      const paramSpec: ParameterObject = {
        name: 'name',
        in: 'body',
      };

      class MyController {
        @get('/greet')
        greet(@param(paramSpec) name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      const expectedSpec = anOperationSpec()
        .withOperationName('greet')
        .withParameter({
          name: 'name',
          schema: {
            type: 'string',
          },
          in: 'body',
        })
        .build();

      expect(actualSpec.paths['/greet']['get']).to.eql(expectedSpec);
    });

    it('infers complex body parameter type', () => {
      const paramSpec: ParameterObject = {
        name: 'name',
        in: 'body',
      };

      class MyBody {
        name: string;
      }

      class MyController {
        @get('/greet')
        greet(@param(paramSpec) name: MyBody) {}
      }

      const actualSpec = getControllerSpec(MyController);

      const expectedSpec = anOperationSpec()
        .withOperationName('greet')
        .withParameter({
          name: 'name',
          schema: {
            $ref: '#/definitions/MyBody',
          },
          in: 'body',
        })
        .build();

      expect(actualSpec.paths['/greet']['get']).to.eql(expectedSpec);
    });

    it('infers complex body parameter schema into the controller spec', () => {
      const fooSpec: ParameterObject = {
        name: 'foo',
        in: 'body',
      };
      const barSpec: ParameterObject = {
        name: 'bar',
        in: 'body',
      };
      @model()
      class Foo {
        @property() price: number;
      }
      @model()
      class Bar {
        @property() name: string;
        @property() foo: Foo;
      }
      class MyController {
        @post('/foo')
        foo(@param(fooSpec) foo: Foo) {}

        @post('/bar')
        bar(@param(barSpec) bar: Bar) {}
      }

      const defs = getControllerSpec(MyController)
        .definitions as DefinitionsObject;

      // tslint:disable-next-line:no-any
      expect(defs).to.have.keys('Foo', 'Bar');
      expect(defs.Foo).to.deepEqual({
        title: 'Foo',
        properties: {
          price: {
            type: 'number',
          },
        },
      });
      expect(defs.Bar).to.deepEqual({
        title: 'Bar',
        properties: {
          name: {
            type: 'string',
          },
          foo: {
            $ref: '#/definitions/Foo',
          },
        },
      });
    });

    it('does not produce nested definitions', () => {
      const paramSpec: ParameterObject = {
        name: 'foo',
        in: 'body',
      };
      @model()
      class Foo {
        @property() bar: number;
      }
      @model()
      class MyBody {
        @property() name: string;
        @property() foo: Foo;
      }
      class MyController {
        @post('/foo')
        foo(@param(paramSpec) body: MyBody) {}
      }

      const defs = getControllerSpec(MyController)
        .definitions as DefinitionsObject;
      expect(defs).to.have.keys('MyBody', 'Foo');
      expect(defs.MyBody).to.not.have.key('definitions');
    });

    it('infers no properties if no property metadata is present', () => {
      const paramSpec: ParameterObject = {
        name: 'foo',
        in: 'body',
      };
      @model()
      class MyBody {
        name: string;
      }
      class MyController {
        @post('/foo')
        foo(@param(paramSpec) foo: MyBody) {}
      }

      const defs = getControllerSpec(MyController)
        .definitions as DefinitionsObject;

      expect(defs).to.have.key('MyBody');
      expect(defs.MyBody).to.not.have.key('properties');
    });

    it('does not infer definition if no class metadata is present', () => {
      const paramSpec: ParameterObject = {
        name: 'foo',
        in: 'body',
      };
      class MyBody {
        @property() name: string;
      }
      class MyController {
        @post('/foo')
        foo(@param(paramSpec) foo: MyBody) {}
      }

      const defs = getControllerSpec(MyController)
        .definitions as DefinitionsObject;

      expect(defs).to.have.key('MyBody');
      expect(defs.MyBody).to.deepEqual({});
    });

    it('can define multiple parameters in order', () => {
      const offsetSpec: ParameterObject = {
        name: 'offset',
        type: 'number',
        in: 'query',
      };

      const pageSizeSpec: ParameterObject = {
        name: 'pageSize',
        type: 'number',
        in: 'query',
      };

      class MyController {
        @get('/')
        @param(offsetSpec)
        @param(pageSizeSpec)
        list(offset?: number, pageSize?: number) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/']['get'].parameters).to.eql([
        offsetSpec,
        pageSizeSpec,
      ]);
    });

    it('can define multiple parameters by arguments', () => {
      const offsetSpec: ParameterObject = {
        name: 'offset',
        type: 'number',
        in: 'query',
      };

      const pageSizeSpec: ParameterObject = {
        name: 'pageSize',
        type: 'number',
        in: 'query',
      };

      class MyController {
        @get('/')
        list(
          @param(offsetSpec) offset?: number,
          @param(pageSizeSpec) pageSize?: number,
        ) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/']['get'].parameters).to.eql([
        offsetSpec,
        pageSizeSpec,
      ]);
    });
    // tslint:disable-next-line:max-line-length
    it('throws an error if @param is used at both method and parameter level', () => {
      expect(() => {
        const offsetSpec: ParameterObject = {
          name: 'offset',
          type: 'number',
          in: 'query',
        };

        const pageSizeSpec: ParameterObject = {
          name: 'pageSize',
          type: 'number',
          in: 'query',
        };
        // tslint:disable-next-line:no-unused-variable
        class MyController {
          @get('/')
          @param(offsetSpec)
          list(offset?: number, @param(pageSizeSpec) pageSize?: number) {}
        }
      }).to.throw(
        /Mixed usage of @param at method\/parameter level is not allowed/,
      );
    });

    it('adds to existing spec provided via @operation', () => {
      const offsetSpec: ParameterObject = {
        name: 'offset',
        type: 'number',
        in: 'query',
      };

      const pageSizeSpec: ParameterObject = {
        name: 'pageSize',
        type: 'number',
        in: 'query',
      };

      const responses: ResponsesObject = {
        200: {
          schema: {
            type: 'string',
          },
          description: 'a string response',
        },
      };

      class MyController {
        @operation('get', '/', {responses})
        @param(offsetSpec)
        @param(pageSizeSpec)
        list(offset?: number, pageSize?: number) {}
      }

      const apiSpec = getControllerSpec(MyController);
      const opSpec: OperationObject = apiSpec.paths['/']['get'];

      expect(opSpec.responses).to.eql(responses);
      expect(opSpec.parameters).to.eql([offsetSpec, pageSizeSpec]);
    });
  });
});
