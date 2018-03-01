// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {get, param, getControllerSpec} from '../../../../..';
import {expect} from '@loopback/testlab';

describe('Routing metadata for parameters', () => {
  describe('@param.header.string', () => {
    it('defines a parameter with in:header type:string', () => {
      class MyController {
        @get('/greet')
        greet(@param.header.string('name') name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet']['get'].parameters).to.eql([
        {
          name: 'name',
          in: 'header',
          schema: {
            type: 'string',
          },
        },
      ]);
    });
  });

  describe('@param.header.number', () => {
    it('defines a parameter with in:header type:number', () => {
      class MyController {
        @get('/greet')
        greet(@param.header.number('name') name: number) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet']['get'].parameters).to.eql([
        {
          name: 'name',
          in: 'header',
          schema: {
            type: 'number',
          },
        },
      ]);
    });
  });

  describe('@param.header.integer', () => {
    it('defines a parameter with in:header type:integer', () => {
      class MyController {
        @get('/greet')
        greet(@param.header.integer('name') name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet']['get'].parameters).to.eql([
        {
          name: 'name',
          in: 'header',
          schema: {
            type: 'integer',
            format: 'int32',
          },
        },
      ]);
    });
  });

  describe('@param.header.boolean', () => {
    it('defines a parameter with in:header type:boolean', () => {
      class MyController {
        @get('/greet')
        greet(@param.header.boolean('name') name: boolean) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greet']['get'].parameters).to.eql([
        {
          name: 'name',
          in: 'header',
          schema: {
            type: 'boolean',
          },
        },
      ]);
    });
  });
});
