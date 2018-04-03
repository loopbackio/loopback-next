// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {authenticate, getAuthenticateMetadata} from '../../..';

describe('Authentication', () => {
  describe('@authenticate decorator', () => {
    it('can add authenticate metadata to target method with options', () => {
      class TestClass {
        @authenticate('my-strategy', {option1: 'value1', option2: 'value2'})
        whoAmI() {}
      }

      const metaData = getAuthenticateMetadata(TestClass, 'whoAmI');
      expect(metaData).to.eql({
        strategy: 'my-strategy',
        options: {option1: 'value1', option2: 'value2'},
      });
    });

    it('can add authenticate metadata to target method without options', () => {
      class TestClass {
        @authenticate('my-strategy')
        whoAmI() {}
      }

      const metaData = getAuthenticateMetadata(TestClass, 'whoAmI');
      expect(metaData).to.eql({strategy: 'my-strategy', options: {}});
    });
  });
});
