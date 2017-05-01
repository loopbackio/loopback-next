// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from 'testlab';
import * as http from 'http';
import {Strategy} from '../..';
import {StrategyAdapter} from '../..';
import {supertest} from 'testlab';

describe('Strategy Adapter', () => {
  let strategy: Strategy;
  let adapter: StrategyAdapter;
  let app: http.Server;
  const mockUser: User = {id: 'mock-user', role: 'mock-role'};
  interface User {
    id: string;
    role: string;
  }

  describe('authenticate()', () => {
    beforeEach(createMockStrategy);
    beforeEach(createAdapter);
    beforeEach(createApp);

    it('authenticates successfully for correct credentials', (done) => {
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
    app = http.createServer(function(req, res) {
      // tslint:disable-next-line:no-floating-promises
      adapter.authenticate(req)
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

  function createAdapter() {
    adapter = new StrategyAdapter(strategy);
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
