// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {StrategyAdapter} from '../..';
import {ParsedRequest, HttpErrors} from '@loopback/core';
import {MockStrategy} from './fixtures/mock-strategy';
import * as http from 'http';

describe('Strategy Adapter', () => {
  const mockUser: User = {id: 'mock-user', role: 'mock-role'};
  interface User {
    id: string;
    role: string;
  }

  describe('authenticate()', () => {
    it('calls the authenticate method of the strategy', async () => {
      let calledFlag = false;
      // TODO: (as suggested by @bajtos) use sinon spy
      class Strategy extends MockStrategy {
        // override authenticate method to set calledFlag
        async authenticate(req: http.ServerRequest) {
          calledFlag = true;
          await super.authenticate(req);
        }
      }
      const strategy = new Strategy();
      const adapter = new StrategyAdapter(strategy);
      const request = <ParsedRequest> {};
      await adapter.authenticate(request);
      expect(calledFlag).to.be.true();
    });

    it('returns a promise which resolves to an object', async () => {
      const strategy = new MockStrategy();
      strategy.setMockUser(mockUser);
      const adapter = new StrategyAdapter(strategy);
      const request = <ParsedRequest> {};
      const user: Object = await adapter.authenticate(request);
      expect(user).to.be.eql(mockUser);
    });

    it('throws Unauthorized error when authentication fails', async () => {
      const strategy = new MockStrategy();
      strategy.setMockUser(mockUser);
      const adapter = new StrategyAdapter(strategy);
      const request = <ParsedRequest> {};
      request.headers = {testState: 'fail'};
      let error;
      try {
        const user: Object = await adapter.authenticate(request);
      } catch (err) {
        error = err;
      }
      expect(error).to.be.instanceof(HttpErrors.Unauthorized);
    });

    it('throws InternalServerError when strategy returns error', async () => {
      const strategy = new MockStrategy();
      strategy.setMockUser(mockUser);
      const adapter = new StrategyAdapter(strategy);
      const request = <ParsedRequest> {};
      request.headers = {testState: 'error'};
      let error;
      try {
        const user: Object = await adapter.authenticate(request);
      } catch (err) {
        error = err;
      }
      expect(error).to.be.instanceof(HttpErrors.InternalServerError);
    });
  });
});

