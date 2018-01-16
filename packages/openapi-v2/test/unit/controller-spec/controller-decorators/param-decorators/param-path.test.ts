// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v2
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {get, param, getControllerSpec} from '../../../../..';
import {expect} from '@loopback/testlab';

describe('Routing metadata for parameters', () => {
  describe('@param.path.string', () => {
    it('defines a parameter with in:path type:string', () => {
      class MyController {
        @get('/greet/{name}')
        @param.path.string('name')
        greet(name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet/{name}']['get'].parameters).to.eql([
        {
          name: 'name',
          type: 'string',
          in: 'path',
        },
      ]);
    });
  });

  describe('@param.path.number', () => {
    it('defines a parameter with in:path type:number', () => {
      class MyController {
        @get('/greet/{name}')
        @param.path.number('name')
        greet(name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet/{name}']['get'].parameters).to.eql([
        {
          name: 'name',
          type: 'number',
          in: 'path',
        },
      ]);
    });
  });

  describe('@param.path.integer', () => {
    it('defines a parameter with in:path type:integer', () => {
      class MyController {
        @get('/greet/{name}')
        @param.path.integer('name')
        greet(name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet/{name}']['get'].parameters).to.eql([
        {
          name: 'name',
          type: 'integer',
          in: 'path',
        },
      ]);
    });
  });

  describe('@param.path.boolean', () => {
    it('defines a parameter with in:path type:boolean', () => {
      class MyController {
        @get('/greet/{name}')
        @param.path.boolean('name')
        greet(name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet/{name}']['get'].parameters).to.eql([
        {
          name: 'name',
          type: 'boolean',
          in: 'path',
        },
      ]);
    });
  });
});
