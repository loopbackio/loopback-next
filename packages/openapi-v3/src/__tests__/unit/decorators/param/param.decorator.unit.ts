// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ParameterObject,
  ResponsesObject,
  OperationObject,
} from '@loopback/openapi-v3-types';
import {param, get, patch, operation, getControllerSpec} from '../../../../';
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
        .withResponse(200, {description: 'Return value of MyController.greet'})
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
            required: true,
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
          @param.array('tags', 'query', {type: 'string'}) tags: string[],
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
        .withResponse(200, {description: 'Return value of MyController.update'})
        .withParameter({
          name: 'id',
          schema: {
            type: 'string',
          },
          in: 'path',
          required: true,
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
        .withResponse(200, {description: 'Return value of MyController.greet'})
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
          // tslint:disable-next-line:no-unused
          class MyController {
            @get('/greet')
            greet(
              @param.array('names', 'query', {type: 'string'}) names: string,
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
          @param.array('names', 'query', {type: 'string'})
          names: /* tslint:disable-next-line:no-any */
          any,
        ) {}
      }

      const actualSpec = getControllerSpec(MyController);

      const expectedSpec = anOperationSpec()
        .withOperationName('greet')
        .withResponse(200, {description: 'Return value of MyController.greet'})
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
          @param.query.number('offset') offset?: number,
          @param.query.number('pageSize') pageSize?: number,
        ) {}
      }

      const apiSpec = getControllerSpec(MyController);
      const opSpec: OperationObject = apiSpec.paths['/']['get'];

      expect(opSpec.responses).to.eql(responses);
      expect(opSpec.parameters).to.eql([offsetSpec, pageSizeSpec]);
    });
  });
});
