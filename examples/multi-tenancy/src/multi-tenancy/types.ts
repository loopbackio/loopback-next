// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-multi-tenancy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ValueOrPromise} from '@loopback/core';
import {RequestContext} from '@loopback/rest';

/**
 * Information about a tenant in the multi-tenancy environment
 */
export interface Tenant {
  id: string;
  [attribute: string]: unknown;
}

export interface MultiTenancyMiddlewareOptions {
  strategyNames: string[];
}

/**
 * Interface for a multi-tenancy strategy to implement
 */
export interface MultiTenancyStrategy {
  /**
   * Name of the strategy
   */
  name: string;
  /**
   * Identify the tenant for a given http request
   * @param requestContext - Http request
   */
  identifyTenant(
    requestContext: RequestContext,
  ): ValueOrPromise<Tenant | undefined>;

  /**
   * Bind tenant-specific resources for downstream artifacts with dependency
   * injection
   * @param requestContext - Request context
   */
  bindResources(
    requestContext: RequestContext,
    tenant: Tenant,
  ): ValueOrPromise<void>;
}
