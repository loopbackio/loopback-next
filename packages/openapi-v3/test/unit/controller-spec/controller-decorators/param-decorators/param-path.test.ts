// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {get, param, getControllerSpec} from '../../../../..';
import {expect} from '@loopback/testlab';

describe('Routing metadata for parameters', () => {
  describe('@param.path.string', () => {
    it('defines a parameter with in:path type:string', () => {
      class MyController {
        @get('/greet/{name}')
        greet(@param.path.string('name') name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet/{name}']['get'].parameters).to.eql([
        {
          name: 'name',
          in: 'path',
          schema: {
            type: 'string',
          },
        },
      ]);
    });
  });

  describe('@param.path.number', () => {
    it('defines a parameter with in:path type:number', () => {
      class MyController {
        @get('/greet/{name}')
        greet(@param.path.number('name') name: number) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet/{name}']['get'].parameters).to.eql([
        {
          name: 'name',
          in: 'path',
          schema: {
            type: 'number',
          },
        },
      ]);
    });
  });

  describe('@param.path.integer', () => {
    it('defines a parameter with in:path type:integer', () => {
      class MyController {
        @get('/greet/{name}')
        greet(@param.path.integer('name') name: number) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet/{name}']['get'].parameters).to.eql([
        {
          name: 'name',
          in: 'path',
          schema: {
            type: 'integer',
            format: 'int32',
          },
        },
      ]);
    });
  });

  describe('@param.path.boolean', () => {
    it('defines a parameter with in:path type:boolean', () => {
      class MyController {
        @get('/greet/{name}')
        greet(@param.path.boolean('name') name: boolean) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet/{name}']['get'].parameters).to.eql([
        {
          name: 'name',
          in: 'path',
          schema: {
            type: 'boolean',
          },
        },
      ]);
    });
  });
});
