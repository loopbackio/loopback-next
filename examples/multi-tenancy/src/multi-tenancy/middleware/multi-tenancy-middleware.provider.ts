// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-multi-tenancy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  config,
  ContextTags,
  extensionPoint,
  extensions,
  Getter,
  Provider,
} from '@loopback/core';
import {asMiddleware, Middleware, RequestContext} from '@loopback/rest';
import debugFactory from 'debug';
import {MultiTenancyBindings, MULTI_TENANCY_STRATEGIES} from '../keys';
import {MultiTenancyMiddlewareOptions, MultiTenancyStrategy} from '../types';
const debug = debugFactory('loopback:multi-tenancy');
/**
 * Provides the multi-tenancy action for a sequence
 */
@extensionPoint(
  MULTI_TENANCY_STRATEGIES,
  {
    tags: {
      [ContextTags.KEY]: MultiTenancyBindings.MIDDLEWARE,
    },
  },
  asMiddleware({
    group: 'tenancy',
    downstreamGroups: 'findRoute',
  }),
)
export class MultiTenancyMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @extensions()
    private readonly getMultiTenancyStrategies: Getter<MultiTenancyStrategy[]>,
    @config()
    private options: MultiTenancyMiddlewareOptions = {
      strategyNames: ['header'],
    },
  ) {}

  value(): Middleware {
    return async (ctx, next) => {
      await this.action(ctx as RequestContext);
      return next();
    };
  }

  /**
   * The implementation of authenticate() sequence action.
   * @param request - The incoming request provided by the REST layer
   */
  async action(requestCtx: RequestContext) {
    debug('Identifying tenant for request %s', requestCtx.basePath);
    const tenancy = await this.identifyTenancy(requestCtx);
    if (tenancy == null) return;
    debug(
      'Tenant identified by strategy %s',
      tenancy.strategy.name,
      tenancy.tenant,
    );
    debug('Binding resources for tenant', tenancy.tenant);
    requestCtx.bind(MultiTenancyBindings.CURRENT_TENANT).to(tenancy.tenant);
    await tenancy.strategy.bindResources(requestCtx, tenancy.tenant);
    return tenancy.tenant;
  }

  private async identifyTenancy(requestCtx: RequestContext) {
    debug('Tenancy action is configured with', this.options);
    const strategyNames = this.options.strategyNames;
    let strategies = await this.getMultiTenancyStrategies();
    strategies = strategies
      .filter(s => strategyNames.includes(s.name))
      .sort((a, b) => {
        return strategyNames.indexOf(a.name) - strategyNames.indexOf(b.name);
      });
    if (debug.enabled) {
      debug(
        'Tenancy strategies',
        strategies.map(s => s.name),
      );
    }
    for (const strategy of strategies) {
      debug('Trying tenancy strategy %s', strategy.name);
      const tenant = await strategy.identifyTenant(requestCtx);
      if (tenant != null) {
        debug('Tenant is now identified by strategy %s', strategy.name, tenant);
        return {tenant, strategy};
      }
    }
    debug('No tenant is identified');
    return undefined;
  }
}
