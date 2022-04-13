// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {UserProfile} from '@loopback/security';

/**
 * An interface for generating and verifying a token
 */
export interface TokenService {
  /**
   * Verifies the validity of a token string and returns a user profile
   *
   * @param token The token/secret which should be validated/verified.
   *
   * @returns The UserProfile which belongs to the given token.
   */
  verifyToken(token: string): Promise<UserProfile>;

  /**
   * Generates a token string based on a user profile
   *
   * @param userProfile A UserProfile for which a token should be generated.
   *
   * @returns a generated token/secret for a given UserProfile.
   */
  generateToken(userProfile: UserProfile): Promise<string>;

  /**
   * Revokes a given token (if supported by token system)
   *
   * @param token The token/secret which should be revoked/invalidated.
   *
   * @returns true, if the given token was invalidated.
   */
  revokeToken?(token: string): Promise<boolean>;
}
