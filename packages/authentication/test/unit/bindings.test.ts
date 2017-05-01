// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from 'testlab';
import * as http from 'http';
import {Strategy} from '../..';
import {getAuthenticatedUser} from '../..';
import {supertest} from 'testlab';

describe('Authentication Bindings', () => {
  let strategy: Strategy;
  let app: http.Server;
  const mockUser: User = {id: 'mock-user', role: 'mock-role'};
  interface User {
    id: string;
    role: string;
  }

  describe('getAuthenticatedUser()', () => {
    beforeEach(createMockStrategy);
    beforeEach(createApp);

    it('returns user profile for correct credentials', (done) => {
      const request = supertest(app);
      request.get('/').end(function(err, res) {
        if (err) return done(err);
        const responseUser = JSON.parse(res.text);
        expect(responseUser).to.be.eql(mockUser);
        done();
      });
    });
  });

  /**
   * Test fixture for an app to authenticate requests
   */
  function createApp() {
    app = http.createServer(function(req: http.ServerRequest, res: http.ServerResponse) {
      // tslint:disable-next-line:no-floating-promises
      getAuthenticatedUser(true, req, strategy)
      .then((user) => {
        res.end(JSON.stringify(user));
      }).catch((err) => {
        res.end(JSON.stringify(err));
      });
    });
  }

  function createMockStrategy() {
    strategy = new MockStrategy();
  }

  /**
   * Test fixture for an asynchronous strategy
   */
  class MockStrategy {
    authenticate(req: http.ServerRequest) {
      process.nextTick(this.returnMockUser.bind(this));
    }
    returnMockUser() {
      this.success(mockUser);
    }
    success(user: Object) {
      throw new Error('should be overrided by adapter');
    }
    fail() {
      throw new Error('should be overrided by adapter');
    }
  }
});
