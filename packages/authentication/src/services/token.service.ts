// Copyright IBM Corp. 2019. All Rights Reserved.
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
   */
  verifyToken(token: string): Promise<UserProfile>;
  /**
   * Generates a token string based on a user profile
   */
  generateToken(userProfile: UserProfile): Promise<string>;
}
