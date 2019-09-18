// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authorization
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  AUTHENTICATED,
  authorize,
  EVERYONE,
  getAuthorizationMetadata,
  UNAUTHENTICATED,
} from '../..';

describe('Authentication', () => {
  describe('@authorize decorator', () => {
    it('can add authorize metadata to target method', () => {
      class TestClass {
        @authorize({allowedRoles: ['ADMIN'], scopes: ['secret.read']})
        getSecret() {}

        @authorize({allowedRoles: ['OWNER'], scopes: ['data.update']})
        update() {}
      }

      let metaData = getAuthorizationMetadata(TestClass, 'getSecret');
      expect(metaData).to.eql({
        allowedRoles: ['ADMIN'],
        scopes: ['secret.read'],
      });

      metaData = getAuthorizationMetadata(TestClass, 'update');
      expect(metaData).to.eql({
        allowedRoles: ['OWNER'],
        scopes: ['data.update'],
      });
    });

    it('can add authorize metadata to target class', () => {
      @authorize({allowedRoles: ['ADMIN'], scopes: ['secret.read']})
      class TestClass {
        getSecret() {}

        @authorize({allowedRoles: ['OWNER'], scopes: ['data.update']})
        update() {}
      }

      let metaData = getAuthorizationMetadata(TestClass, 'getSecret');
      expect(metaData).to.eql({
        allowedRoles: ['ADMIN'],
        scopes: ['secret.read'],
      });

      metaData = getAuthorizationMetadata(TestClass, 'update');
      expect(metaData).to.eql({
        allowedRoles: ['OWNER'],
        scopes: ['data.update'],
      });
    });

    it('honors method level decoration over class level', () => {
      @authorize({allowedRoles: ['ADMIN'], scopes: ['secret']})
      class TestClass {
        @authorize({allowedRoles: ['ADMIN'], scopes: ['secret.read']})
        getSecret() {}

        @authorize({allowedRoles: ['OWNER'], scopes: ['data.update']})
        update() {}
      }

      let metaData = getAuthorizationMetadata(TestClass, 'getSecret');
      expect(metaData).to.eql({
        allowedRoles: ['ADMIN'],
        scopes: ['secret.read'],
      });

      metaData = getAuthorizationMetadata(TestClass, 'update');
      expect(metaData).to.eql({
        allowedRoles: ['OWNER'],
        scopes: ['data.update'],
      });
    });

    it('can add allowAll to target method', () => {
      class TestClass {
        @authorize.allowAll()
        getSecret() {}
      }

      const metaData = getAuthorizationMetadata(TestClass, 'getSecret');
      expect(metaData).to.eql({
        allowedRoles: [EVERYONE],
      });
    });

    it('can add allowAllExcept to target method', () => {
      class TestClass {
        @authorize.allowAllExcept('xyz')
        getSecret() {}
      }

      const metaData = getAuthorizationMetadata(TestClass, 'getSecret');
      expect(metaData).to.eql({
        allowedRoles: [EVERYONE],
        deniedRoles: ['xyz'],
      });
    });

    it('can add denyAll to target method', () => {
      class TestClass {
        @authorize.denyAll()
        getSecret() {}
      }

      const metaData = getAuthorizationMetadata(TestClass, 'getSecret');
      expect(metaData).to.eql({
        deniedRoles: [EVERYONE],
      });
    });

    it('can add denyAllExcept to target method', () => {
      class TestClass {
        @authorize.denyAllExcept('xyz')
        getSecret() {}
      }

      const metaData = getAuthorizationMetadata(TestClass, 'getSecret');
      expect(metaData).to.eql({
        allowedRoles: ['xyz'],
        deniedRoles: [EVERYONE],
      });
    });

    it('can add allowAuthenticated to target method', () => {
      class TestClass {
        @authorize.allowAuthenticated()
        getSecret() {}
      }

      const metaData = getAuthorizationMetadata(TestClass, 'getSecret');
      expect(metaData).to.eql({
        allowedRoles: [AUTHENTICATED],
      });
    });

    it('can add denyUnauthenticated to target method', () => {
      class TestClass {
        @authorize.denyUnauthenticated()
        getSecret() {}
      }

      const metaData = getAuthorizationMetadata(TestClass, 'getSecret');
      expect(metaData).to.eql({
        deniedRoles: [UNAUTHENTICATED],
      });
    });

    it('can skip authorization with a flag', () => {
      class TestClass {
        @authorize.skip()
        getSecret() {}
      }

      const metaData = getAuthorizationMetadata(TestClass, 'getSecret');
      expect(metaData).to.eql({skip: true});
    });

    it('can stack decorators to target method', () => {
      class TestClass {
        @authorize.allow('a1', 'a2')
        @authorize.deny('d1', 'd2')
        @authorize({
          allowedRoles: ['a1', 'a3'],
          deniedRoles: ['d3'],
        })
        @authorize.scope('s1', 's2')
        @authorize.vote('v1', 'v2')
        getSecret() {}
      }

      const metaData = getAuthorizationMetadata(TestClass, 'getSecret');
      expect(metaData).to.deepEqual({
        voters: ['v1', 'v2'],
        allowedRoles: ['a1', 'a3', 'a2'],
        deniedRoles: ['d3', 'd1', 'd2'],
        scopes: ['s1', 's2'],
      });
    });
  });
});
