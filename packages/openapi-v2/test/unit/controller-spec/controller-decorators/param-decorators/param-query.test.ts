// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v2
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {get, param, getControllerSpec} from '../../../../..';
import {expect} from '@loopback/testlab';

describe('Routing metadata for parameters', () => {
  describe('@param.query.string', () => {
    it('defines a parameter with in:query type:string', () => {
      class MyController {
        @get('/greet')
        @param.query.string('name')
        greet(name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet']['get'].parameters).to.eql([
        {
          name: 'name',
          type: 'string',
          in: 'query',
        },
      ]);
    });
  });

  describe('@param.query.number', () => {
    it('defines a parameter with in:query type:number', () => {
      class MyController {
        @get('/greet')
        @param.query.number('name')
        greet(name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet']['get'].parameters).to.eql([
        {
          name: 'name',
          type: 'number',
          in: 'query',
        },
      ]);
    });
  });

  describe('@param.query.integer', () => {
    it('defines a parameter with in:query type:integer', () => {
      class MyController {
        @get('/greet')
        @param.query.integer('name')
        greet(name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet']['get'].parameters).to.eql([
        {
          name: 'name',
          type: 'integer',
          in: 'query',
        },
      ]);
    });
  });

  describe('@param.query.boolean', () => {
    it('defines a parameter with in:query type:boolean', () => {
      class MyController {
        @get('/greet')
        @param.query.boolean('name')
        greet(name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet']['get'].parameters).to.eql([
        {
          name: 'name',
          type: 'boolean',
          in: 'query',
        },
      ]);
    });
  });
});
