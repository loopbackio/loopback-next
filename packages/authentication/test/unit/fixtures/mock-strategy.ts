// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Strategy, StrategyCreated, AuthenticateOptions} from 'passport';
import {PassportRequest} from '../../..';

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
  async authenticate(
    this: StrategyCreated<this> & this,
    req: Express.Request,
    options?: AuthenticateOptions,
  ) {
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
  async verify(this: StrategyCreated<this> & this, request: Express.Request) {
    // A workaround for buggy typings provided by @types/passport
    const req = request as PassportRequest;

    if (
      req.headers &&
      req.headers.testState &&
      req.headers.testState === 'fail'
    ) {
      this.returnUnauthorized('authorization failed');
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

  returnMockUser(this: StrategyCreated<this> & this) {
    this.success(this.mockUser);
  }

  returnUnauthorized(
    this: StrategyCreated<this> & this,
    challenge?: string | number,
    status?: number,
  ) {
    this.fail(challenge, status);
  }

  returnError(this: StrategyCreated<this> & this, err: string) {
    this.error(err);
  }
}
