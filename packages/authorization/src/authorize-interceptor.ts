// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/authorization
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  asGlobalInterceptor,
  BindingAddress,
  config,
  Context,
  injectable,
  Interceptor,
  InvocationContext,
  Next,
  NonVoid,
  Provider,
} from '@loopback/core';
import {SecurityBindings, UserProfile} from '@loopback/security';
import debugFactory from 'debug';
import {getAuthorizationMetadata} from './decorators/authorize';
import {AuthorizationBindings, AuthorizationTags} from './keys';
import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationError,
  AuthorizationOptions,
  Authorizer,
} from './types';
import {createPrincipalFromUserProfile} from './util';

const debug = debugFactory('loopback:authorization:interceptor');

@injectable(asGlobalInterceptor('authorization'))
export class AuthorizationInterceptor implements Provider<Interceptor> {
  private options: AuthorizationOptions;

  constructor(
    @config({fromBinding: AuthorizationBindings.COMPONENT})
    options: AuthorizationOptions = {},
  ) {
    this.options = {
      defaultDecision: AuthorizationDecision.DENY,
      precedence: AuthorizationDecision.DENY,
      defaultStatusCodeForDeny: 403,
      ...options,
    };
    debug('Authorization options', this.options);
  }

  value(): Interceptor {
    return this.intercept.bind(this);
  }

  async intercept(
    invocationCtx: InvocationContext,
    next: Next,
  ): Promise<NonVoid> {
    const description = debug.enabled ? invocationCtx.description : '';
    let metadata = getAuthorizationMetadata(
      invocationCtx.target,
      invocationCtx.methodName,
    );
    if (!metadata) {
      debug('No authorization metadata is found for %s', description);
    }
    metadata = metadata ?? this.options.defaultMetadata;
    if (!metadata || metadata?.skip) {
      debug('Authorization is skipped for %s', description);
      const result = await next();
      return result;
    }
    debug('Authorization metadata for %s', description, metadata);

    // retrieve it from authentication module
    const user = await invocationCtx.get<UserProfile>(SecurityBindings.USER, {
      optional: true,
    });

    debug('Current user', user);

    const authorizationCtx: AuthorizationContext = {
      principals: user ? [createPrincipalFromUserProfile(user)] : [],
      roles: [],
      scopes: [],
      resource: invocationCtx.targetName,
      invocationContext: invocationCtx,
    };

    debug('Security context for %s', description, authorizationCtx);
    const authorizers = await loadAuthorizers(
      invocationCtx,
      metadata.voters ?? [],
    );

    let finalDecision = this.options.defaultDecision;
    for (const fn of authorizers) {
      const decision = await fn(authorizationCtx, metadata);
      debug('Decision', decision);
      // Reset the final decision if an explicit Deny or Allow is voted
      if (decision && decision !== AuthorizationDecision.ABSTAIN) {
        finalDecision = decision;
      }
      // we can add another interceptor to process the error
      if (
        decision === AuthorizationDecision.DENY &&
        this.options.precedence === AuthorizationDecision.DENY
      ) {
        debug('Access denied');
        const error = new AuthorizationError('Access denied');
        error.statusCode = this.options.defaultStatusCodeForDeny;
        throw error;
      }
      if (
        decision === AuthorizationDecision.ALLOW &&
        this.options.precedence === AuthorizationDecision.ALLOW
      ) {
        debug('Access allowed');
        break;
      }
    }
    debug('Final decision', finalDecision);
    // Handle the final decision
    if (finalDecision === AuthorizationDecision.DENY) {
      const error = new AuthorizationError('Access denied');
      error.statusCode = this.options.defaultStatusCodeForDeny;
      throw error;
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
