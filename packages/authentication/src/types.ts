// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Request} from '@loopback/rest';
import {Entity, Model} from '@loopback/repository';

// /**
//  * interface definition of a function which accepts a request
//  * and returns an authenticated user
//  */
// export interface AuthenticateFn<U extends Model> {
//   (request: Request): Promise<U | undefined>;
// }

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
 * Some user scenarios to consider
 *
 * - If
 *
 * @example
 * @authenticate({
 *   strategy: 'JWT',
 *   extractor: 'header',
 *   action: 'verify'
 * })
 * async findOrdersForUser() {
 *   const user = this.currentUser;
 *   return await userRepo.orders(user.id);
 * }
 */
export type AuthenticationMetadata = {
  action?: ActionType;
  strategy?: string;
  extractor?: string;
  options: Object;
};

/**
 * The action from a particular strategy that an endpoint
 * wants to perform.
 */
export type ActionType = 'register' | 'login' | 'verify';
