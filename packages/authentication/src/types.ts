// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {addExtension, Constructor, Context} from '@loopback/core';
import {Request} from '@loopback/rest';
import {AuthenticationBindings} from './keys';

/**
 * interface definition of a function which accepts a request
 * and returns an authenticated user
 */
export interface AuthenticateFn {
  (request: Request): Promise<UserProfile | undefined>;
}

/**
 * interface definition of a user profile
 * http://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
 */
export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
}

/**
 * An interface that describes the common authentication strategy.
 *
 * An authentication strategy is a class with an
 * 'authenticate' method that verifies a user's credentials and
 * returns the corresponding user profile.
 *
 */
export interface AuthenticationStrategy {
  /**
   * The 'name' property is a unique identifier for the
   * authentication strategy ( for example : 'basic', 'jwt', etc)
   */
  name: string;

  /**
   * The 'authenticate' method takes in a given request and returns a user profile
   * which is an instance of 'UserProfile'.
   * (A user profile is a minimal subset of a user object)
   * If the user credentials are valid, this method should return a 'UserProfile' instance.
   * If the user credentials are invalid, this method should throw an error
   * If the user credentials are missing, this method should throw an error, or return 'undefined'
   * and let the authentication action deal with it.
   *
   * @param request - Express request object
   */
  authenticate(request: Request): Promise<UserProfile | undefined>;
}

export const AUTHENTICATION_STRATEGY_NOT_FOUND =
  'AUTHENTICATION_STRATEGY_NOT_FOUND';

export const USER_PROFILE_NOT_FOUND = 'USER_PROFILE_NOT_FOUND';

/**
 * Registers an authentication strategy as an extension of the AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME extension point.
 */
export function registerAuthenticationStrategy(
  context: Context,
  strategyClass: Constructor<AuthenticationStrategy>,
) {
  addExtension(
    context,
    AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
    strategyClass,
    {
      namespace:
        AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
    },
  );
}
