// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/example-multi-tenancy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RequestContext} from '@loopback/rest';
import {expect} from '@loopback/testlab';
import {
  MultiTenancyMiddlewareOptions,
  MultiTenancyStrategy,
  Tenant,
} from '../../../multi-tenancy/types';

describe('Multi-tenancy types (unit)', () => {
  describe('Tenant interface', () => {
    it('has required id property', () => {
      const tenant: Tenant = {
        id: 'tenant1',
      };

      expect(tenant.id).to.equal('tenant1');
    });

    it('supports additional attributes', () => {
      const tenant: Tenant = {
        id: 'tenant1',
        name: 'Tenant One',
        database: 'db1',
        active: true,
      };

      expect(tenant.id).to.equal('tenant1');
      expect(tenant.name).to.equal('Tenant One');
      expect(tenant.database).to.equal('db1');
      expect(tenant.active).to.equal(true);
    });

    it('supports nested attributes', () => {
      const tenant: Tenant = {
        id: 'tenant1',
        config: {
          theme: 'dark',
          features: ['feature1', 'feature2'],
        },
      };

      expect(tenant.config).to.be.an.Object();
    });

    it('supports various id formats', () => {
      const tenant1: Tenant = {id: 'string-id'};
      const tenant2: Tenant = {id: '123'};
      const tenant3: Tenant = {id: 'uuid-1234-5678'};

      expect(tenant1.id).to.be.a.String();
      expect(tenant2.id).to.be.a.String();
      expect(tenant3.id).to.be.a.String();
    });
  });

  describe('MultiTenancyMiddlewareOptions interface', () => {
    it('has strategyNames array', () => {
      const options: MultiTenancyMiddlewareOptions = {
        strategyNames: ['header', 'jwt'],
      };

      expect(options.strategyNames).to.be.an.Array();
      expect(options.strategyNames).to.have.length(2);
    });

    it('supports single strategy', () => {
      const options: MultiTenancyMiddlewareOptions = {
        strategyNames: ['header'],
      };

      expect(options.strategyNames).to.deepEqual(['header']);
    });

    it('supports multiple strategies', () => {
      const options: MultiTenancyMiddlewareOptions = {
        strategyNames: ['header', 'jwt', 'query', 'host'],
      };

      expect(options.strategyNames).to.have.length(4);
    });

    it('supports empty strategy array', () => {
      const options: MultiTenancyMiddlewareOptions = {
        strategyNames: [],
      };

      expect(options.strategyNames).to.be.empty();
    });
  });

  describe('MultiTenancyStrategy interface', () => {
    it('defines required properties and methods', () => {
      const strategy: MultiTenancyStrategy = {
        name: 'test-strategy',
        identifyTenant: async () => ({id: 'tenant1'}),
        bindResources: async () => {},
      };

      expect(strategy.name).to.equal('test-strategy');
      expect(strategy.identifyTenant).to.be.a.Function();
      expect(strategy.bindResources).to.be.a.Function();
    });

    it('identifyTenant can return tenant', async () => {
      const strategy: MultiTenancyStrategy = {
        name: 'test',
        identifyTenant: async () => ({id: 'tenant1', name: 'Test Tenant'}),
        bindResources: async () => {},
      };

      const mockContext = {} as unknown as RequestContext;
      const tenant = await strategy.identifyTenant(mockContext);

      expect(tenant).to.not.be.undefined();
      expect(tenant!.id).to.equal('tenant1');
    });

    it('identifyTenant can return undefined', async () => {
      const strategy: MultiTenancyStrategy = {
        name: 'test',
        identifyTenant: async () => undefined,
        bindResources: async () => {},
      };

      const mockContext = {} as unknown as RequestContext;
      const tenant = await strategy.identifyTenant(mockContext);

      expect(tenant).to.be.undefined();
    });

    it('identifyTenant can be synchronous', () => {
      const strategy: MultiTenancyStrategy = {
        name: 'test',
        identifyTenant: () => ({id: 'tenant1'}),
        bindResources: async () => {},
      };

      const mockContext = {} as unknown as RequestContext;
      const tenant = strategy.identifyTenant(mockContext);

      expect(tenant).to.not.be.undefined();
    });

    it('bindResources can be synchronous', () => {
      const strategy: MultiTenancyStrategy = {
        name: 'test',
        identifyTenant: async () => ({id: 'tenant1'}),
        bindResources: () => {},
      };

      const mockContext = {} as unknown as RequestContext;
      const result = strategy.bindResources(mockContext, {id: 'tenant1'});

      expect(result).to.be.undefined();
    });

    it('supports different strategy names', () => {
      const headerStrategy: MultiTenancyStrategy = {
        name: 'header',
        identifyTenant: async () => ({id: 'tenant1'}),
        bindResources: async () => {},
      };

      const jwtStrategy: MultiTenancyStrategy = {
        name: 'jwt',
        identifyTenant: async () => ({id: 'tenant2'}),
        bindResources: async () => {},
      };

      expect(headerStrategy.name).to.equal('header');
      expect(jwtStrategy.name).to.equal('jwt');
    });
  });

  describe('Type compatibility', () => {
    it('Tenant works with different attribute types', () => {
      const tenant: Tenant = {
        id: 'tenant1',
        stringAttr: 'value',
        numberAttr: 123,
        booleanAttr: true,
        arrayAttr: [1, 2, 3],
        objectAttr: {nested: 'value'},
        nullAttr: null,
        undefinedAttr: undefined,
      };

      expect(tenant.id).to.equal('tenant1');
      expect(tenant.stringAttr).to.be.a.String();
      expect(tenant.numberAttr).to.be.a.Number();
      expect(tenant.booleanAttr).to.be.a.Boolean();
      expect(tenant.arrayAttr).to.be.an.Array();
      expect(tenant.objectAttr).to.be.an.Object();
    });

    it('MultiTenancyStrategy methods accept RequestContext', () => {
      const strategy: MultiTenancyStrategy = {
        name: 'test',
        identifyTenant: ctx => {
          // ctx should be RequestContext
          expect(ctx).to.not.be.undefined();
          return {id: 'tenant1'};
        },
        bindResources: (ctx, tenant) => {
          // ctx should be RequestContext, tenant should be Tenant
          expect(ctx).to.not.be.undefined();
          expect(tenant).to.not.be.undefined();
          expect(tenant.id).to.be.a.String();
        },
      };

      expect(strategy).to.be.an.Object();
    });
  });
});

// Made with Bob
