// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication-passport
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// Should it be imported from 'express'?
// The `Request` type from 'express' is not compatible
// with the one from `@loopback/rest` now.
import {UserProfile} from '@loopback/security';
import {Request} from '@loopback/rest';
import {AuthenticateOptions, Strategy} from 'passport';

/**
 * Test fixture for a mock asynchronous passport-strategy
 */
export class MockPassportStrategy extends Strategy {
  // user to return for successful authentication
  private mockUser: UserProfile;
  public name = 'mock-strategy';

  setMockUser(userObj: UserProfile) {
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
