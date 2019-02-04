// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Strategy, AuthenticateOptions} from 'passport';
import {Request} from 'express';

/**
 * Test fixture for a mock asynchronous passport-strategy
 */
export class MockStrategy extends Strategy {
  // user to return for successful authentication
  private mockUser: Object;

  setMockUser(userObj: Object) {
    this.mockUser = userObj;
  }

  /**
   * authenticate() function similar to passport-strategy packages
   * @param req
   */
  async authenticate(req: Request, options?: AuthenticateOptions) {
    await this.verify(req);
  }
  /**
   * @param req
   * mock verification function; usually passed in as constructor argument for
   * passport-strategy
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
      this.returnUnauthorized('authorization failed');
      return;
    } else if (
      request.headers &&
      request.headers.testState &&
      request.headers.testState === 'error'
    ) {
      this.returnError('unexpected error');
      return;
    }
    process.nextTick(this.returnMockUser.bind(this));
  }

  returnMockUser() {
    this.success(this.mockUser);
  }

  returnUnauthorized(challenge?: string | number, status?: number) {
    this.fail(challenge, status);
  }

  returnError(err: string) {
    this.error(err);
  }
}
