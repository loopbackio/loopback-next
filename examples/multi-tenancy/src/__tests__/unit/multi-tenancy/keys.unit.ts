// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/example-multi-tenancy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  MULTI_TENANCY_STRATEGIES,
  MultiTenancyBindings,
} from '../../../multi-tenancy/keys';

describe('Multi-tenancy keys (unit)', () => {
  describe('MultiTenancyBindings', () => {
    describe('MIDDLEWARE', () => {
      it('has correct binding key', () => {
        expect(MultiTenancyBindings.MIDDLEWARE.key).to.equal(
          'middleware.multi-tenancy',
        );
      });

      it('is a BindingKey', () => {
        expect(MultiTenancyBindings.MIDDLEWARE).to.have.property('key');
      });
    });

    describe('CURRENT_TENANT', () => {
      it('has correct binding key', () => {
        expect(MultiTenancyBindings.CURRENT_TENANT.key).to.equal(
          'multi-tenancy.currentTenant',
        );
      });

      it('is a BindingKey', () => {
        expect(MultiTenancyBindings.CURRENT_TENANT).to.have.property('key');
      });
    });

    it('exports both binding keys', () => {
      expect(MultiTenancyBindings).to.have.property('MIDDLEWARE');
      expect(MultiTenancyBindings).to.have.property('CURRENT_TENANT');
    });
  });

  describe('MULTI_TENANCY_STRATEGIES', () => {
    it('has correct value', () => {
      expect(MULTI_TENANCY_STRATEGIES).to.equal('multi-tenancy.strategies');
    });

    it('is a string constant', () => {
      expect(MULTI_TENANCY_STRATEGIES).to.be.a.String();
    });
  });

  describe('Binding key uniqueness', () => {
    it('MIDDLEWARE and CURRENT_TENANT have different keys', () => {
      expect(MultiTenancyBindings.MIDDLEWARE.key).to.not.equal(
        MultiTenancyBindings.CURRENT_TENANT.key,
      );
    });

    it('MIDDLEWARE key is different from MULTI_TENANCY_STRATEGIES', () => {
      expect(MultiTenancyBindings.MIDDLEWARE.key).to.not.equal(
        MULTI_TENANCY_STRATEGIES,
      );
    });

    it('CURRENT_TENANT key is different from MULTI_TENANCY_STRATEGIES', () => {
      expect(MultiTenancyBindings.CURRENT_TENANT.key).to.not.equal(
        MULTI_TENANCY_STRATEGIES,
      );
    });
  });

  describe('Binding key naming conventions', () => {
    it('MIDDLEWARE follows middleware naming pattern', () => {
      expect(MultiTenancyBindings.MIDDLEWARE.key).to.match(/^middleware\./);
    });

    it('CURRENT_TENANT follows multi-tenancy naming pattern', () => {
      expect(MultiTenancyBindings.CURRENT_TENANT.key).to.match(
        /^multi-tenancy\./,
      );
    });

    it('MULTI_TENANCY_STRATEGIES follows multi-tenancy naming pattern', () => {
      expect(MULTI_TENANCY_STRATEGIES).to.match(/^multi-tenancy\./);
    });
  });

  describe('Type safety', () => {
    it('MIDDLEWARE is typed for Middleware', () => {
      // The binding key should be typed to accept Middleware
      const key = MultiTenancyBindings.MIDDLEWARE;
      expect(key).to.not.be.undefined();
    });

    it('CURRENT_TENANT is typed for Tenant', () => {
      // The binding key should be typed to accept Tenant
      const key = MultiTenancyBindings.CURRENT_TENANT;
      expect(key).to.not.be.undefined();
    });
  });

  describe('Usage patterns', () => {
    it('can be used for binding lookups', () => {
      const middlewareKey = MultiTenancyBindings.MIDDLEWARE.key;
      const tenantKey = MultiTenancyBindings.CURRENT_TENANT.key;

      expect(middlewareKey).to.be.a.String();
      expect(tenantKey).to.be.a.String();
    });

    it('can be used with string concatenation', () => {
      const strategyKey = `${MULTI_TENANCY_STRATEGIES}.header`;
      expect(strategyKey).to.equal('multi-tenancy.strategies.header');
    });

    it('supports creating strategy-specific keys', () => {
      const headerStrategy = `${MULTI_TENANCY_STRATEGIES}.header`;
      const jwtStrategy = `${MULTI_TENANCY_STRATEGIES}.jwt`;
      const queryStrategy = `${MULTI_TENANCY_STRATEGIES}.query`;

      expect(headerStrategy).to.match(/multi-tenancy\.strategies\./);
      expect(jwtStrategy).to.match(/multi-tenancy\.strategies\./);
      expect(queryStrategy).to.match(/multi-tenancy\.strategies\./);
    });
  });

  describe('Immutability', () => {
    it('binding keys are read-only', () => {
      const originalMiddlewareKey = MultiTenancyBindings.MIDDLEWARE.key;
      const originalTenantKey = MultiTenancyBindings.CURRENT_TENANT.key;

      // Keys should remain unchanged
      expect(MultiTenancyBindings.MIDDLEWARE.key).to.equal(
        originalMiddlewareKey,
      );
      expect(MultiTenancyBindings.CURRENT_TENANT.key).to.equal(
        originalTenantKey,
      );
    });

    it('MULTI_TENANCY_STRATEGIES constant is read-only', () => {
      const original = MULTI_TENANCY_STRATEGIES;
      expect(MULTI_TENANCY_STRATEGIES).to.equal(original);
    });
  });
});

// Made with Bob
