// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ParsedRequest} from '@loopback/rest';

/**
 * interface definition of a function which accepts a request
 * and returns an authenticated user
 */
export interface AuthenticateFn {
  (request: ParsedRequest): Promise<UserProfile | undefined>;
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
 * Authentication metadata stored via Reflection API
 */
export interface AuthenticationMetadata {
  /**
   * Name of the authentication strategy
   */
  strategy: string;
  /**
   * Options for authentication
   */
  options?: Object;
}

/**
 * Interface for authentication providers
 */
export interface Authenticator {
  /**
   * Check if the given strategy is supported by the authenticator
   * @param stragety Name of the authentication strategy
   */
  isSupported(strategy: string): boolean;

  /**
   * Authenticate a request with given options
   * @param request HTTP request
   * @param metadata Authentication metadata
   */
  authenticate(
    request: ParsedRequest,
    metadata?: AuthenticationMetadata,
  ): Promise<UserProfile | undefined>;
}

/**
 * Passport monkey-patches Node.js' IncomingMessage prototype
 * and adds extra methods like "login" and "isAuthenticated"
 */
export type PassportRequest = ParsedRequest & Express.Request;
