// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {get, param, getControllerSpec} from '../../../../..';
import {expect} from '@loopback/testlab';

describe('Routing metadata for parameters', () => {
  describe('@param.query.string', () => {
    it('defines a parameter with in:query type:string', () => {
      class MyController {
        @get('/greet')
        greet(@param.query.string('name') name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet']['get'].parameters).to.eql([
        {
          name: 'name',
          in: 'query',
          schema: {
            type: 'string',
          },
        },
      ]);
    });
  });

  describe('@param.query.number', () => {
    it('defines a parameter with in:query type:number', () => {
      class MyController {
        @get('/greet')
        greet(@param.query.number('name') name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet']['get'].parameters).to.eql([
        {
          name: 'name',
          in: 'query',
          schema: {
            type: 'number',
          },
        },
      ]);
    });
  });

  describe('@param.query.integer', () => {
    it('defines a parameter with in:query type:integer', () => {
      class MyController {
        @get('/greet')
        greet(@param.query.integer('name') name: number) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet']['get'].parameters).to.eql([
        {
          name: 'name',
          in: 'query',
          schema: {
            type: 'integer',
            format: 'int32',
          },
        },
      ]);
    });
  });

  describe('@param.query.boolean', () => {
    it('defines a parameter with in:query type:boolean', () => {
      class MyController {
        @get('/greet')
        greet(@param.query.boolean('name') name: boolean) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet']['get'].parameters).to.eql([
        {
          name: 'name',
          in: 'query',
          schema: {
            type: 'boolean',
          },
        },
      ]);
    });
  });
});
