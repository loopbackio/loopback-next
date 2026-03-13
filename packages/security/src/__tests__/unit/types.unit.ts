// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/security
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  DefaultSubject,
  Permission,
  securityId,
  TypedPrincipal,
  UserProfile,
} from '../../types';

describe('Security Types', () => {
  describe('securityId symbol', () => {
    it('is a symbol', () => {
      expect(typeof securityId).to.equal('symbol');
    });

    it('has correct description', () => {
      expect(securityId.toString()).to.equal('Symbol(securityId)');
    });
  });

  describe('TypedPrincipal', () => {
    it('creates a typed principal with user type', () => {
      const user: UserProfile = {
        [securityId]: 'user-123',
        name: 'John Doe',
      };
      const typedPrincipal = new TypedPrincipal(user, 'USER');
      expect(typedPrincipal.principal).to.equal(user);
      expect(typedPrincipal.type).to.equal('USER');
    });

    it('generates security id with type prefix', () => {
      const user: UserProfile = {
        [securityId]: 'user-123',
        name: 'John Doe',
      };
      const typedPrincipal = new TypedPrincipal(user, 'USER');
      expect(typedPrincipal[securityId]).to.equal('USER:user-123');
    });

    it('handles different principal types', () => {
      const app = {
        [securityId]: 'app-456',
        clientId: 'my-app',
      };
      const typedPrincipal = new TypedPrincipal(app, 'APPLICATION');
      expect(typedPrincipal[securityId]).to.equal('APPLICATION:app-456');
    });

    it('preserves principal properties', () => {
      const user: UserProfile = {
        [securityId]: 'user-123',
        name: 'Jane Smith',
        email: 'jane@example.com',
      };
      const typedPrincipal = new TypedPrincipal(user, 'USER');
      expect(typedPrincipal.principal.name).to.equal('Jane Smith');
      expect(typedPrincipal.principal.email).to.equal('jane@example.com');
    });
  });

  describe('Permission', () => {
    it('creates a permission with action and resource type', () => {
      const permission = new Permission();
      permission.action = 'read';
      permission.resourceType = 'Order';
      expect(permission.action).to.equal('read');
      expect(permission.resourceType).to.equal('Order');
    });

    it('generates security id for resource-level permission', () => {
      const permission = new Permission();
      permission.action = 'create';
      permission.resourceType = 'User';
      expect(permission[securityId]).to.equal('User:create');
    });

    it('generates security id for property-level permission', () => {
      const permission = new Permission();
      permission.action = 'update';
      permission.resourceType = 'User';
      permission.resourceProperty = 'email';
      expect(permission[securityId]).to.equal('User.email:update');
    });

    it('generates security id for instance-level permission', () => {
      const permission = new Permission();
      permission.action = 'delete';
      permission.resourceType = 'Order';
      permission.resourceId = 'order-0001';
      expect(permission[securityId]).to.equal('Order:delete:order-0001');
    });

    it('generates security id for property instance permission', () => {
      const permission = new Permission();
      permission.action = 'read';
      permission.resourceType = 'User';
      permission.resourceProperty = 'email';
      permission.resourceId = 'user-123';
      expect(permission[securityId]).to.equal('User.email:read:user-123');
    });

    it('handles different actions', () => {
      const actions = ['create', 'read', 'update', 'delete', 'execute'];
      actions.forEach(action => {
        const permission = new Permission();
        permission.action = action;
        permission.resourceType = 'Resource';
        expect(permission[securityId]).to.equal(`Resource:${action}`);
      });
    });
  });

  describe('DefaultSubject', () => {
    let subject: DefaultSubject;

    beforeEach(() => {
      subject = new DefaultSubject();
    });

    describe('initialization', () => {
      it('initializes with empty sets', () => {
        expect(subject.principals.size).to.equal(0);
        expect(subject.authorities.size).to.equal(0);
        expect(subject.credentials.size).to.equal(0);
      });
    });

    describe('addUser()', () => {
      it('adds a single user', () => {
        const user: UserProfile = {
          [securityId]: 'user-123',
          name: 'John Doe',
        };
        subject.addUser(user);
        expect(subject.principals.size).to.equal(1);
      });

      it('adds multiple users', () => {
        const user1: UserProfile = {
          [securityId]: 'user-123',
          name: 'John Doe',
        };
        const user2: UserProfile = {
          [securityId]: 'user-456',
          name: 'Jane Smith',
        };
        subject.addUser(user1, user2);
        expect(subject.principals.size).to.equal(2);
      });

      it('wraps users in TypedPrincipal with USER type', () => {
        const user: UserProfile = {
          [securityId]: 'user-123',
          name: 'John Doe',
        };
        subject.addUser(user);
        const principals = Array.from(subject.principals);
        expect(principals[0].type).to.equal('USER');
        expect(principals[0].principal).to.equal(user);
      });
    });

    describe('addApplication()', () => {
      it('adds an application', () => {
        const app = {
          [securityId]: 'app-123',
          clientId: 'my-app',
        };
        subject.addApplication(app);
        expect(subject.principals.size).to.equal(1);
      });

      it('wraps application in TypedPrincipal with APPLICATION type', () => {
        const app = {
          [securityId]: 'app-123',
          clientId: 'my-app',
        };
        subject.addApplication(app);
        const principals = Array.from(subject.principals);
        expect(principals[0].type).to.equal('APPLICATION');
        expect(principals[0].principal).to.equal(app);
      });
    });

    describe('addAuthority()', () => {
      it('adds a single authority', () => {
        const permission = new Permission();
        permission.action = 'read';
        permission.resourceType = 'Order';
        subject.addAuthority(permission);
        expect(subject.authorities.size).to.equal(1);
      });

      it('adds multiple authorities', () => {
        const perm1 = new Permission();
        perm1.action = 'read';
        perm1.resourceType = 'Order';
        const perm2 = new Permission();
        perm2.action = 'create';
        perm2.resourceType = 'User';
        subject.addAuthority(perm1, perm2);
        expect(subject.authorities.size).to.equal(2);
      });
    });

    describe('addCredential()', () => {
      it('adds a single credential', () => {
        const credential = {token: 'abc123'};
        subject.addCredential(credential);
        expect(subject.credentials.size).to.equal(1);
      });

      it('adds multiple credentials', () => {
        const cred1 = {token: 'abc123'};
        const cred2 = {apiKey: 'xyz789'};
        subject.addCredential(cred1, cred2);
        expect(subject.credentials.size).to.equal(2);
      });
    });

    describe('getPrincipal()', () => {
      it('returns principal by type', () => {
        const user: UserProfile = {
          [securityId]: 'user-123',
          name: 'John Doe',
        };
        subject.addUser(user);
        const principal = subject.getPrincipal('USER');
        expect(principal).to.equal(user);
      });

      it('returns undefined for non-existent type', () => {
        const principal = subject.getPrincipal('ADMIN');
        expect(principal).to.be.undefined();
      });

      it('returns first principal of matching type', () => {
        const user1: UserProfile = {
          [securityId]: 'user-123',
          name: 'John Doe',
        };
        const user2: UserProfile = {
          [securityId]: 'user-456',
          name: 'Jane Smith',
        };
        subject.addUser(user1, user2);
        const principal = subject.getPrincipal('USER');
        expect(principal).to.equal(user1);
      });

      it('distinguishes between different principal types', () => {
        const user: UserProfile = {
          [securityId]: 'user-123',
          name: 'John Doe',
        };
        const app = {
          [securityId]: 'app-456',
          clientId: 'my-app',
        };
        subject.addUser(user);
        subject.addApplication(app);
        expect(subject.getPrincipal('USER')).to.equal(user);
        expect(subject.getPrincipal('APPLICATION')).to.equal(app);
      });
    });

    describe('user getter', () => {
      it('returns user profile', () => {
        const user: UserProfile = {
          [securityId]: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
        };
        subject.addUser(user);
        expect(subject.user).to.equal(user);
      });

      it('returns undefined when no user exists', () => {
        expect(subject.user).to.be.undefined();
      });

      it('returns first user when multiple users exist', () => {
        const user1: UserProfile = {
          [securityId]: 'user-123',
          name: 'John Doe',
        };
        const user2: UserProfile = {
          [securityId]: 'user-456',
          name: 'Jane Smith',
        };
        subject.addUser(user1, user2);
        expect(subject.user).to.equal(user1);
      });
    });

    describe('complex scenarios', () => {
      it('handles subject with user, app, authorities, and credentials', () => {
        const user: UserProfile = {
          [securityId]: 'user-123',
          name: 'John Doe',
        };
        const app = {
          [securityId]: 'app-456',
          clientId: 'my-app',
        };
        const permission = new Permission();
        permission.action = 'read';
        permission.resourceType = 'Order';
        const credential = {token: 'abc123'};

        subject.addUser(user);
        subject.addApplication(app);
        subject.addAuthority(permission);
        subject.addCredential(credential);

        expect(subject.principals.size).to.equal(2);
        expect(subject.authorities.size).to.equal(1);
        expect(subject.credentials.size).to.equal(1);
        expect(subject.user).to.equal(user);
      });
    });
  });
});

// Made with Bob
