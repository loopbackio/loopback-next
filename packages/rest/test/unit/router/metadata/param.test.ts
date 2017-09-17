// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  get,
  api,
  param,
  getControllerSpec,
  operation,
} from '../../../..';
import {
 OperationObject,
 ParameterObject,
 ResponsesObject,
} from '@loopback/openapi-spec';
import {expect} from '@loopback/testlab';
import {anOperationSpec} from '@loopback/openapi-spec-builder';

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

    it('throws an error if @param is used at both method and parameter level',
      () => {
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

        class MyController {
          @get('/')
          @param(offsetSpec)
          list(
            offset?: number,
            @param(pageSizeSpec) pageSize?: number,
          ) {}
        }
      }).to.throw(
        /Mixed usage of @param at method\/parameter level is not allowed/);
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
