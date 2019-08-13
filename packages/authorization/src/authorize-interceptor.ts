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
import {getAuthorizationMetadata} from './decorators/authorize';
import {AuthorizationTags} from './keys';
import {
  AuthorizationContext,
  AuthorizationDecision,
  Authorizer,
  AuthorizationError,
  Principal,
} from './types';
import {AuthenticationBindings, UserProfile} from '@loopback/authentication';

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
    const metadata = getAuthorizationMetadata(
      invocationCtx.target,
      invocationCtx.methodName,
    );
    if (!metadata) {
      debug('No authorization metadata is found %s', description);
      const result = await next();
      return result;
    }
    debug('Authorization metadata for %s', description, metadata);

    // retrieve it from authentication module
    const user = await invocationCtx.get<UserProfile>(
      AuthenticationBindings.CURRENT_USER,
      {
        optional: true,
      },
    );

    debug('Current user', user);

    const authorizationCtx: AuthorizationContext = {
      principals: user ? [userToPrinciple(user)] : [],
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
      // we can add another interceptor to process the error
      if (decision === AuthorizationDecision.DENY) {
        const error = new AuthorizationError('Access denied');
        error.statusCode = 401;
        throw error;
      }
    }
    return next();
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

// This is a workaround before we extract a common layer
// for authentication and authorization.
function userToPrinciple(user: UserProfile): Principal {
  return {
    name: user.name || user.id,
    id: user.id,
    email: user.email,
    type: 'USER',
  };
}
