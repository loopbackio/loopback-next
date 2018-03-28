// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authorization
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  asGlobalInterceptor,
  bind,
  BindingTemplate,
  filterByTag,
  inject,
  Interceptor,
  Provider,
} from '@loopback/context';
import * as debugFactory from 'debug';
import {getAuthorizeMetadata} from './decorators/authorize';
import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizeFn,
} from './types';

const debug = debugFactory('loopback:authorization:interceptor');

const globalInterceptorTemplate = asGlobalInterceptor(
  'authorization',
) as BindingTemplate;

@bind(globalInterceptorTemplate)
export class AuthorizationInterceptor implements Provider<Interceptor> {
  constructor(
    @inject(filterByTag('authorizationProvider'))
    private authorizationFunctions: AuthorizeFn[],
  ) {}

  value(): Interceptor {
    return async (invocationCtx, next) => {
      const description = debug.enabled ? invocationCtx.toString() : '';
      const metadata = getAuthorizeMetadata(
        invocationCtx.target,
        invocationCtx.methodName,
      );
      if (!metadata) {
        debug('No authorization metadata is found %s', description);
        return await next();
      }
      debug('Authorization metadata for %s', description, metadata);
      const user = await invocationCtx.get<string>('current.user', {
        optional: true,
      });
      const authCtx: AuthorizationContext = {
        principals: user ? [{name: user, type: 'USER'}] : [],
        roles: [],
        scopes: [],
        resource: invocationCtx.targetName,
        invocationContext: invocationCtx,
      };
      debug('Security context for %s', description, authCtx);
      for (const fn of this.authorizationFunctions) {
        const decision = await fn(authCtx, metadata);
        if (decision === AuthorizationDecision.DENY) {
          throw new Error('Access denied');
        }
      }
      return await next();
    };
  }
}
