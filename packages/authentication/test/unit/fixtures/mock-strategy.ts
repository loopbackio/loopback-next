// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
import {Strategy} from 'passport';
import * as http from 'http';

/**
 * Test fixture for a mock asynchronous passport-strategy
 */
export class MockStrategy implements Strategy {
  // user to return for successful authentication
  private mockUser: Object;
  constructor() {}
  setMockUser(userObj: Object) {
    this.mockUser = userObj;
  }
  /**
   * authenticate() function similar to passport-strategy packages
   * @param req
   */
  async authenticate(req: http.ServerRequest) {
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
  async verify(req: http.ServerRequest) {
    if (
      req.headers &&
      req.headers.testState &&
      req.headers.testState === 'fail'
    ) {
      this.returnUnauthorized({error: 'authorization failed'});
      return;
    } else if (
      req.headers &&
      req.headers.testState &&
      req.headers.testState === 'error'
    ) {
      this.returnError('unexpected error');
      return;
    }
    process.nextTick(this.returnMockUser.bind(this));
  }
  success(user: Object) {
    throw new Error('should be overridden by adapter');
  }
  fail(challenge: Object) {
    throw new Error('should be overridden by adapter');
  }
  error(error: string) {
    throw new Error('should be overridden by adapter');
  }
  returnMockUser() {
    this.success(this.mockUser);
  }
  returnUnauthorized(challenge: Object) {
    this.fail(challenge);
  }
  returnError(err: string) {
    this.error(err);
  }
}
