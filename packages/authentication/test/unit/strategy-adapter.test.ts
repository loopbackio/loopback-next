// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from 'testlab';
import {ShimRequest} from '../..';
import {StrategyAdapter} from '../..';
import {ParsedRequest} from '../..';
const passportStrategy = require('passport-strategy');

describe('Strategy Adapter', () => {
  const mockUser: User = {id: 'mock-user', role: 'mock-role'};
  interface User {
    id: string;
    role: string;
  }

  describe('authenticate()', () => {

    it('calls the authenticate method of the strategy', (done) => {
      const strategy = new passportStrategy();
      let calledFlag = false;
      strategy.authenticate = function() {
        calledFlag = true;
      };
      const adapter = new StrategyAdapter(strategy);
      const request = new ShimRequest();
      // tslint:disable-next-line:no-floating-promises
      adapter.authenticate(request as ParsedRequest);
      expect(calledFlag).to.be.true();
      done();
    });

    it('adds success handler to the strategy', (done) => {
      const strategy = new MockStrategy();
      const adapter = new StrategyAdapter(strategy);
      const request = new ShimRequest();
      // tslint:disable-next-line:no-floating-promises
      adapter.authenticate(request as ParsedRequest)
      .then((user: User) => {
        expect(user).to.be.eql(mockUser);
        done();
      });
    });
  });

  /**
   * Test fixture for an asynchronous strategy
   */
  class MockStrategy {
    authenticate(req: ParsedRequest) {
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
