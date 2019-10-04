// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {addExtension, Constructor, Context} from '@loopback/core';
import {Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {AuthenticationBindings} from './keys';

/**
 * Authentication metadata stored via Reflection API
 */
export interface AuthenticationMetadata {
  /**
   * Name of the authentication strategy
   */
  strategy: string;
  /**
   * Options for the authentication strategy
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: {[name: string]: any};
  /**
   * A flag to skip authentication
   */
  skip?: boolean;
}

/**
 * interface definition of a function which accepts a request
 * and returns an authenticated user
 */
export interface AuthenticateFn {
  (request: Request): Promise<UserProfile | undefined>;
}

/**
 * Options for authentication component
 */
export interface AuthenticationOptions {
  /**
   * Default authentication metadata if a method or class is not decorated with
   * `@authenticate`. If not set, no default authentication will be enforced for
   * those methods without authentication metadata.
   */
  defaultMetadata?: AuthenticationMetadata;
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
 * Registers an authentication strategy as an extension of the
 * AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME extension
 * point.
 * @param context - Context object
 * @param strategyClass - Class for the authentication strategy
 */
export function registerAuthenticationStrategy(
  context: Context,
  strategyClass: Constructor<AuthenticationStrategy>,
) {
  return addExtension(
    context,
    AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
    strategyClass,
    {
      namespace:
        AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
    },
  );
}
