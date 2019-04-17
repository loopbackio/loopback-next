// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { Request } from '@loopback/rest';

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
   * @param request
   */
  authenticate(request: Request): Promise<UserProfile | undefined>;
}

export interface UserService<U, C> {
  /**
   * Verify the identity of a user, construct a corresponding user profile using
   * the user information and return the user profile.
   *
   * A pseudo code for basic authentication:
   * ```ts
   * verifyCredentials(credentials: C): Promise<U> {
   *   // the id field shouldn't be hardcoded
   *   user = await UserRepo.find(credentials.id);
   *   matched = await passwordService.compare(user.password, credentials.password);
   *   if (matched) return user;
   *   // throw a JS error, agnostic of the client type
   *   throw new Error('authentication failed');
   * };
   * ```
   *
   * A pseudo code for 3rd party authentication:
   * ```ts
   * type UserInfo = {
   *   accessToken: string;
   *   refreshToken: string;
   *   userProfile: string;
   * };
   * verifyCredentials(credentials: C): Promise<U> {
   *   try {
   *     userInfo: UserInfo = await getUserInfoFromFB(credentials);
   *   } catch (e) {
   *     // throw a JS error, agnostic of the client type
   *     throw e;
   *   }
   * };
   * ```
   * @param credentials Credentials for basic auth or configurations for 3rd party.
   *                    Example see the
   */
  verifyCredentials(credentials: C): Promise<U>;

  /**
   * Convert the user returned by `verifyCredentials()` to a common
   * user profile that describes a user in your application
   * @param user The user returned from `verifyCredentials()`
   */
  convertToUserProfile(user: U): UserProfile;
}
