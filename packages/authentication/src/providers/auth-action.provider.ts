// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject, injectable, Provider, Setter} from '@loopback/core';
import {
  asMiddleware,
  Middleware,
  RedirectRoute,
  Request,
  RestMiddlewareGroups,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {AuthenticationBindings} from '../keys';
import {
  AuthenticateFn,
  AuthenticationStrategy,
  AUTHENTICATION_STRATEGY_NOT_FOUND,
  USER_PROFILE_NOT_FOUND,
} from '../types';
/**
 * Provides the authentication action for a sequence
 * @example `context.bind('authentication.actions.authenticate').toProvider(AuthenticateActionProvider)`
 */
export class AuthenticateActionProvider implements Provider<AuthenticateFn> {
  constructor(
    // The provider is instantiated for Sequence constructor,
    // at which time we don't have information about the current
    // route yet. This information is needed to determine
    // what auth strategy should be used.
    // To solve this, we are injecting a getter function that will
    // defer resolution of the strategy until authenticate() action
    // is executed.
    @inject.getter(AuthenticationBindings.STRATEGY)
    readonly getStrategies: Getter<
      AuthenticationStrategy | AuthenticationStrategy[] | undefined
    >,
    @inject.setter(SecurityBindings.USER)
    readonly setCurrentUser: Setter<UserProfile>,
    @inject.setter(AuthenticationBindings.AUTHENTICATION_REDIRECT_URL)
    readonly setRedirectUrl: Setter<string>,
    @inject.setter(AuthenticationBindings.AUTHENTICATION_REDIRECT_STATUS)
    readonly setRedirectStatus: Setter<number>,
  ) {}

  /**
   * @returns authenticateFn
   */
  value(): AuthenticateFn {
    return request => this.action(request);
  }

  /**
   * The implementation of authenticate() sequence action.
   * @param request - The incoming request provided by the REST layer
   */
  async action(request: Request): Promise<UserProfile | undefined> {
    let strategies = await this.getStrategies();
    if (!strategies) {
      // The invoked operation does not require authentication.
      return undefined;
    }
    // convert to array if required
    strategies = Array.isArray(strategies) ? strategies : [strategies];

    let authenticated = false;
    let redirected = false;
    let authError: Error | undefined;
    let authResponse: UserProfile | RedirectRoute | undefined;
    let userProfile: UserProfile | undefined;

    for (const strategy of strategies) {
      // the first strategy to succeed or redirect will halt the execution chain
      if (authenticated || redirected) break;

      try {
        authResponse = await strategy.authenticate(request);

        // response from `strategy.authenticate()` could return an object of type UserProfile or RedirectRoute
        if (RedirectRoute.isRedirectRoute(authResponse)) {
          redirected = true;
          const redirectOptions = authResponse;
          // bind redirection url and status to the context
          // controller should handle actual redirection
          this.setRedirectUrl(redirectOptions.targetLocation);
          this.setRedirectStatus(redirectOptions.statusCode);
        } else if (authResponse) {
          authenticated = true;
          // if `strategy.authenticate()` returns an object of type UserProfile, set it as current user
          userProfile = authResponse as UserProfile;
        } else if (!authResponse) {
          // important to throw a non-protocol-specific error here
          const error = new Error(
            `User profile not returned from strategy's authenticate function`,
          );
          Object.assign(error, {
            code: USER_PROFILE_NOT_FOUND,
          });
          throw error;
        }
      } catch (error) {
        authError = authError ?? error;
      }
    }

    if (!authenticated && !redirected) throw authError;

    if (userProfile) {
      this.setCurrentUser(userProfile);
      return userProfile;
    }
  }
}

@injectable(
  asMiddleware({
    group: RestMiddlewareGroups.AUTHENTICATION,
    upstreamGroups: [RestMiddlewareGroups.FIND_ROUTE],
  }),
)
export class AuthenticationMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @inject(AuthenticationBindings.AUTH_ACTION)
    private authenticate: AuthenticateFn,
  ) {}

  value(): Middleware {
    return async (ctx, next) => {
      try {
        await this.authenticate(ctx.request);
      } catch (error) {
        if (
          error.code === AUTHENTICATION_STRATEGY_NOT_FOUND ||
          error.code === USER_PROFILE_NOT_FOUND
        ) {
          error.statusCode = 401;
        }
        throw error;
      }
      return next();
    };
  }
}
