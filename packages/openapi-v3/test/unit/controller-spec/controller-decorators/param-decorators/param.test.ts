import {
  ParameterObject,
  ResponsesObject,
  OperationObject,
} from '@loopback/openapi-spec-types';
import {param, get, patch, operation, getControllerSpec} from '../../../../../';
import {anOperationSpec} from '@loopback/openapi-spec-builder';
import {expect} from '@loopback/testlab';

describe('Routing metadata for parameters', () => {
  describe('@param', () => {
    it('defines a new parameter', () => {
      const paramSpec: ParameterObject = {
        name: 'name',
        schema: {
          type: 'string',
        },
        in: 'query',
      };

      class MyController {
        @get('/greet')
        greet(@param(paramSpec) name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      const expectedSpec = anOperationSpec()
        .withOperationName('greet')
        .withParameter(paramSpec)
        .build();
      expect(actualSpec.paths['/greet']['get']).to.eql(expectedSpec);
    });
    it('infers ts primitive types', () => {
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
            name: 'address',
            in: 'query',
          })
          address: object,
        ) {}
      }

      const actualSpec = getControllerSpec(MyController);

      const expectedSpec = anOperationSpec()
        .withOperationName('update')
        .withParameter({
          name: 'id',
          schema: {
            type: 'string',
          },
          in: 'path',
        })
        .withParameter({
          name: 'name',
          schema: {
            type: 'string',
          },
          in: 'query',
        })
        .withParameter({
          name: 'age',
          schema: {
            type: 'number',
          },
          in: 'query',
        })
        .withParameter({
          name: 'vip',
          schema: {
            type: 'boolean',
          },
          in: 'query',
        })
        .withParameter({
          name: 'tags',
          schema: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          in: 'query',
        })
        .withParameter({
          name: 'address',
          schema: {
            type: 'object',
          },
          in: 'query',
        })
        .build();

      expect(actualSpec.paths['/update/{id}']['patch']).to.eql(expectedSpec);
    });
    it('infers array type without explicit type', () => {
      class MyController {
        @get('/greet')
        greet(
          @param({
            name: 'names',
            in: 'query',
            schema: {items: {type: 'string'}},
          })
          names: string[],
        ) {}
      }

      const actualSpec = getControllerSpec(MyController);

      const expectedSpec = anOperationSpec()
        .withOperationName('greet')
        .withParameter({
          name: 'names',
          schema: {
            type: 'array',
            items: {
              type: 'string',
            },
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
              @param.array('names', 'query', {type: 'string'})
              names: string,
            ) {}
          }
        },
        Error,
        `The parameter type is set to 'array' but the JavaScript type is String`,
      );
    });
    it('adds to existing spec provided via @operation', () => {
      const offsetSpec: ParameterObject = {
        name: 'offset',
        in: 'query',
        schema: {
          type: 'number',
        },
      };

      const pageSizeSpec: ParameterObject = {
        name: 'pageSize',
        in: 'query',
        schema: {
          type: 'number',
        },
      };

      const responses: ResponsesObject = {
        200: {
          content: {
            '*/*': {
              schema: {
                type: 'string',
              },
            },
          },
          description: 'a string response',
        },
      };

      class MyController {
        @operation('get', '/', {responses})
        list(
          @param({name: 'offset', in: 'query'})
          offset?: number,
          @param({name: 'pageSize', in: 'query'})
          pageSize?: number,
        ) {}
      }

      const apiSpec = getControllerSpec(MyController);
      const opSpec: OperationObject = apiSpec.paths['/']['get'];

      expect(opSpec.responses).to.eql(responses);
      expect(opSpec.parameters).to.eql([offsetSpec, pageSizeSpec]);
    });
  });
});
