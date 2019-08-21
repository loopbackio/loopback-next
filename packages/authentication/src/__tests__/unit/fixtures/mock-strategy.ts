// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {AuthenticationStrategy} from '../../../types';

class AuthenticationError extends Error {
  statusCode?: number;
}

/**
 * Test fixture for a mock asynchronous authentication strategy
 */
export class MockStrategy implements AuthenticationStrategy {
  name: 'MockStrategy';
  // user to return for successful authentication
  private mockUser: UserProfile;

  setMockUser(userObj: UserProfile) {
    this.mockUser = userObj;
  }

  returnMockUser(): UserProfile {
    return this.mockUser;
  }

  async authenticate(req: Request): Promise<UserProfile> {
    return this.verify(req);
  }
  /**
   * @param req
   * mock verification function
   *
   * For the purpose of mock tests we have this here
   * pass req.query.testState = 'fail' to mock failed authorization
   * pass req.query.testState = 'error' to mock unexpected error
   */
  async verify(request: Request) {
    if (
      request.headers &&
      request.headers.testState &&
      request.headers.testState === 'fail'
    ) {
      const err = new AuthenticationError('authorization failed');
      err.statusCode = 401;
      throw err;
    } else if (
      request.headers &&
      request.headers.testState &&
      request.headers.testState === 'error'
    ) {
      throw new Error('unexpected error');
    }
    return this.returnMockUser();
  }
}
