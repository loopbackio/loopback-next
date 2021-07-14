// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-multi-tenancy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RequestContext} from '@loopback/rest';
import debugFactory from 'debug';
import {MultiTenancyStrategy} from '../types';
import {BaseStrategy} from './base-strategy';

const debug = debugFactory('loopback:multi-tenancy:strategy:query');

/**
 * Use `tenant-id` http query parameter to identify the tenant id
 */
export class QueryStrategy
  extends BaseStrategy
  implements MultiTenancyStrategy
{
  name = 'query';

  identifyTenant(requestContext: RequestContext) {
    const tenantId = requestContext.request.query['tenant-id'] as string;
    debug('tenant-id', tenantId);
    return tenantId == null ? undefined : {id: tenantId};
  }
}
