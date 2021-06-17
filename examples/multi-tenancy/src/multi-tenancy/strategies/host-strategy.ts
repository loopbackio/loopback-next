// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/example-multi-tenancy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {config} from '@loopback/core';
import {RequestContext} from '@loopback/rest';
import debugFactory from 'debug';
import {MultiTenancyStrategy, Tenant} from '../types';
import {BaseStrategy} from './base-strategy';

const debug = debugFactory('loopback:multi-tenancy:strategy:host');
/**
 * Use `host` to identify the tenant id
 */
export class HostStrategy extends BaseStrategy implements MultiTenancyStrategy {
  name = 'host';

  @config()
  mapping: Record<string, string> = {
    '127.0.0.1': 'abc',
  };

  identifyTenant(requestContext: RequestContext) {
    const host = requestContext.request.headers.host;
    debug('host', host);
    return this.mapHostToTenant(host);
  }

  mapHostToTenant(host: string | undefined): Tenant | undefined {
    if (host == null) return undefined;
    const hostname = host.split(':')[0];
    const id = this.mapping[hostname];
    debug('tenant id for host %s: %s', hostname, id);
    if (id == null) return undefined;
    return {id};
  }
}
