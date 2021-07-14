// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {authenticate, getAuthenticateMetadata} from '../../..';

describe('Authentication', () => {
  describe('@authenticate decorator', () => {
    it('can add authenticate metadata to target method', () => {
      class TestClass {
        @authenticate('my-strategy')
        whoAmI() {}
      }

      const metaData = getAuthenticateMetadata(TestClass, 'whoAmI');
      expect(metaData?.[0]).to.eql({
        strategy: 'my-strategy',
      });
    });

    it('can add authenticate metadata to target method with an object', () => {
      class TestClass {
        @authenticate({
          strategy: 'my-strategy',
          options: {option1: 'value1', option2: 'value2'},
        })
        whoAmI() {}
      }

      const metaData = getAuthenticateMetadata(TestClass, 'whoAmI');
      expect(metaData?.[0]).to.eql({
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
      expect(metaData?.[0]).to.eql({
        strategy: 'my-strategy',
      });
    });

    it('can add authenticate metadata to target method with multiple strategies', () => {
      class TestClass {
        @authenticate('my-strategy', 'my-strategy2')
        whoAmI() {}
      }

      const metaData = getAuthenticateMetadata(TestClass, 'whoAmI');
      expect(metaData?.[0]).to.eql({
        strategy: 'my-strategy',
      });
      expect(metaData?.[1]).to.eql({
        strategy: 'my-strategy2',
      });
    });

    it('can add authenticate metadata to target method with multiple objects', () => {
      class TestClass {
        @authenticate(
          {
            strategy: 'my-strategy',
            options: {option1: 'value1', option2: 'value2'},
          },
          {
            strategy: 'my-strategy2',
            options: {option1: 'value1', option2: 'value2'},
          },
        )
        whoAmI() {}
      }

      const metaData = getAuthenticateMetadata(TestClass, 'whoAmI');
      expect(metaData?.[0]).to.eql({
        strategy: 'my-strategy',
        options: {option1: 'value1', option2: 'value2'},
      });
      expect(metaData?.[1]).to.eql({
        strategy: 'my-strategy2',
        options: {option1: 'value1', option2: 'value2'},
      });
    });

    it('adds authenticate metadata to target class', () => {
      @authenticate('my-strategy')
      class TestClass {
        whoAmI() {}
      }

      const metaData = getAuthenticateMetadata(TestClass, 'whoAmI');
      expect(metaData?.[0]).to.eql({
        strategy: 'my-strategy',
      });
    });

    it('overrides class level metadata by method level', () => {
      @authenticate({
        strategy: 'my-strategy',
        options: {option1: 'value1', option2: 'value2'},
      })
      class TestClass {
        @authenticate({
          strategy: 'another-strategy',
          options: {
            option1: 'valueA',
            option2: 'value2',
          },
        })
        whoAmI() {}
      }

      const metaData = getAuthenticateMetadata(TestClass, 'whoAmI');
      expect(metaData?.[0]).to.eql({
        strategy: 'another-strategy',
        options: {option1: 'valueA', option2: 'value2'},
      });
    });
  });

  it('can skip authentication', () => {
    @authenticate('my-strategy')
    class TestClass {
      @authenticate.skip()
      whoAmI() {}
    }

    const metaData = getAuthenticateMetadata(TestClass, 'whoAmI');
    expect(metaData?.[0]).to.containEql({skip: true});
  });

  it('can skip authentication at class level', () => {
    @authenticate.skip()
    class TestClass {
      whoAmI() {}
    }

    const metaData = getAuthenticateMetadata(TestClass, 'whoAmI');
    expect(metaData?.[0]).to.containEql({skip: true});
  });
});
