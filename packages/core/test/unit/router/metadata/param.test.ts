// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {get, param, ParameterObject, getApiSpec} from '../../../..';
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

      const actualSpec = getApiSpec(MyController);

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

      const actualSpec = getApiSpec(MyController);

      expect(actualSpec.paths['/']['get'].parameters).to.eql([
        offsetSpec,
        pageSizeSpec,
      ]);
    });
  });
});
