// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authorization
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  asGlobalInterceptor,
  bind,
  BindingAddress,
  Context,
  filterByTag,
  inject,
  Interceptor,
  InvocationContext,
  Next,
  Provider,
} from '@loopback/context';
import * as debugFactory from 'debug';
import {getAuthorizeMetadata} from './decorators/authorize';
import {AuthorizationTags} from './keys';
import {AuthorizationContext, AuthorizationDecision, Authorizer} from './types';

const debug = debugFactory('loopback:authorization:interceptor');

@bind(asGlobalInterceptor('authorization'))
export class AuthorizationInterceptor implements Provider<Interceptor> {
  constructor(
    @inject(filterByTag(AuthorizationTags.AUTHORIZER))
    private authorizers: Authorizer[],
  ) {}

  value(): Interceptor {
    return this.intercept.bind(this);
  }

  async intercept(invocationCtx: InvocationContext, next: Next) {
    const description = debug.enabled ? invocationCtx.description : '';
    const metadata = getAuthorizeMetadata(
      invocationCtx.target,
      invocationCtx.methodName,
    );
    if (!metadata) {
      debug('No authorization metadata is found %s', description);
      return await next();
    }
    debug('Authorization metadata for %s', description, metadata);
    const user = await invocationCtx.get<{name: string}>('current.user', {
      optional: true,
    });
    debug('Current user', user);
    const authorizationCtx: AuthorizationContext = {
      principals: user ? [{name: user.name, type: 'USER'}] : [],
      roles: [],
      scopes: [],
      resource: invocationCtx.targetName,
      invocationContext: invocationCtx,
    };
    debug('Security context for %s', description, authorizationCtx);
    let authorizers = await loadAuthorizers(
      invocationCtx,
      metadata.voters || [],
    );
    authorizers = authorizers.concat(this.authorizers);
    for (const fn of authorizers) {
      const decision = await fn(authorizationCtx, metadata);
      if (decision === AuthorizationDecision.DENY) {
        throw new Error('Access denied');
      }
    }
    return await next();
  }
}

async function loadAuthorizers(
  ctx: Context,
  authorizers: (Authorizer | BindingAddress<Authorizer>)[],
) {
  const authorizerFunctions: Authorizer[] = [];
  const bindings = ctx.findByTag<Authorizer>(AuthorizationTags.AUTHORIZER);
  authorizers = authorizers.concat(bindings.map(b => b.key));
  for (const keyOrFn of authorizers) {
    if (typeof keyOrFn === 'function') {
      authorizerFunctions.push(keyOrFn);
    } else {
      const fn = await ctx.get(keyOrFn);
      authorizerFunctions.push(fn);
    }
  }
  return authorizerFunctions;
}
