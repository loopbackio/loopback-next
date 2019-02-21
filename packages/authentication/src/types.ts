// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Request} from '@loopback/rest';
import {Entity} from '@loopback/repository';

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

export type Credentials = {
  email: string;
  password: string;
};

export type AuthenticatedUser<U extends Entity> = {
  authenticated: boolean;
  userInfo?: U;
};

/**
 * An interface describes the common authentication strategy.
 *
 * An authentication strategy is usually a class with an
 * authenticate method that verifies a user's identity and
 * returns the corresponding user profile.
 *
 * Please note this file should be moved to @loopback/authentication
 */
export interface AuthenticationStrategy {
  authenticateRequest(request: Request): Promise<UserProfile | undefined>;
  authenticateUser<U extends Entity>(
    credentials: Credentials,
  ): Promise<AuthenticatedUser<U>>;
  generateAccesstoken(user: UserProfile): Promise<string>;
  decodeAccesstoken(token: string): Promise<UserProfile | undefined>;
}
