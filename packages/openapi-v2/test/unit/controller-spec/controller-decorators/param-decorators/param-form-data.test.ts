// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v2
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {post, param, getControllerSpec} from '../../../../..';
import {expect} from '@loopback/testlab';

describe('Routing metadata for parameters', () => {
  describe('@param.formData.string', () => {
    it('defines a parameter with in:formData type:string', () => {
      class MyController {
        @post('/greeting')
        @param.formData.string('name')
        greet(name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greeting']['post'].parameters).to.eql([
        {
          name: 'name',
          type: 'string',
          in: 'formData',
        },
      ]);
    });
  });

  describe('@param.formData.number', () => {
    it('defines a parameter with in:formData type:number', () => {
      class MyController {
        @post('/greeting')
        @param.formData.number('name')
        greet(name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greeting']['post'].parameters).to.eql([
        {
          name: 'name',
          type: 'number',
          in: 'formData',
        },
      ]);
    });
  });

  describe('@param.formData.integer', () => {
    it('defines a parameter with in:formData type:integer', () => {
      class MyController {
        @post('/greeting')
        @param.formData.integer('name')
        greet(name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greeting']['post'].parameters).to.eql([
        {
          name: 'name',
          type: 'integer',
          in: 'formData',
        },
      ]);
    });
  });

  describe('@param.formData.boolean', () => {
    it('defines a parameter with in:formData type:boolean', () => {
      class MyController {
        @post('/greeting')
        @param.formData.boolean('name')
        greet(name: string) {}
      }

      const actualSpec = getControllerSpec(MyController);

      expect(actualSpec.paths['/greeting']['post'].parameters).to.eql([
        {
          name: 'name',
          type: 'boolean',
          in: 'formData',
        },
      ]);
    });
  });
});
