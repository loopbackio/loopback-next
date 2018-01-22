// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v2
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {get, param, getControllerSpec} from '../../../../..';
import {expect} from '@loopback/testlab';

describe('Routing metadata for parameters', () => {
  describe('@param.header.string', () => {
    it('defines a parameter with in:header type:string', () => {
      class MyController {
        @get('/greet')
        @param.header.string('name')
        greet(name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet']['get'].parameters).to.eql([
        {
          name: 'name',
          type: 'string',
          in: 'header',
        },
      ]);
    });
  });

  describe('@param.header.number', () => {
    it('defines a parameter with in:header type:number', () => {
      class MyController {
        @get('/greet')
        @param.header.number('name')
        greet(name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet']['get'].parameters).to.eql([
        {
          name: 'name',
          type: 'number',
          in: 'header',
        },
      ]);
    });
  });

  describe('@param.header.integer', () => {
    it('defines a parameter with in:header type:integer', () => {
      class MyController {
        @get('/greet')
        @param.header.integer('name')
        greet(name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet']['get'].parameters).to.eql([
        {
          name: 'name',
          type: 'integer',
          in: 'header',
        },
      ]);
    });
  });

  describe('@param.header.boolean', () => {
    it('defines a parameter with in:header type:boolean', () => {
      class MyController {
        @get('/greet')
        @param.header.boolean('name')
        greet(name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet']['get'].parameters).to.eql([
        {
          name: 'name',
          type: 'boolean',
          in: 'header',
        },
      ]);
    });
  });
});
