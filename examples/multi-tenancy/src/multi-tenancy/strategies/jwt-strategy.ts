// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/example-multi-tenancy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RequestContext} from '@loopback/rest';
import debugFactory from 'debug';
import {decode} from 'jsonwebtoken';
import {MultiTenancyStrategy} from '../types';
import {BaseStrategy} from './base-strategy';

const debug = debugFactory('loopback:multi-tenancy:strategy:jwt');

/**
 * Use jwt token to identify the tenant id
 */
export class JWTStrategy extends BaseStrategy implements MultiTenancyStrategy {
  name = 'jwt';

  identifyTenant(requestContext: RequestContext) {
    const authorization = requestContext.request.headers[
      'authorization'
    ] as string;
    debug('authorization', authorization);
    if (authorization?.startsWith('Bearer ')) {
      //split the string into 2 parts : 'Bearer ' and the `xxx.yyy.zzz`
      const parts = authorization.split(' ');
      const token = parts[1];
      debug('JWT token', authorization);
      const json = decode(token, {json: true});
      debug('Token', json);
      const tenantId = json?.tenantId;
      debug('Tenant id', tenantId);
      return tenantId == null ? undefined : {id: tenantId};
    }
  }
}
