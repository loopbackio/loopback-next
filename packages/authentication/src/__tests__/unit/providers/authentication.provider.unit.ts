// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, instantiateClass} from '@loopback/core';
import {Request} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {expect} from '@loopback/testlab';
import {AuthenticateFn, AuthenticationBindings} from '../../..';
import {AuthenticateActionProvider} from '../../../providers';
import {AuthenticationOptions, AuthenticationStrategy} from '../../../types';
import {MockStrategy, MockStrategy2} from '../fixtures/mock-strategy';

describe('AuthenticateActionProvider', () => {
  describe('constructor()', () => {
    it('instantiateClass injects authentication.strategy in the constructor', async () => {
      const context = new Context();
      const strategy = new MockStrategy();
      context.bind(AuthenticationBindings.STRATEGY).to(strategy);
      const provider = await instantiateClass(
        AuthenticateActionProvider,
        context,
      );
      expect(await provider.getStrategies()).to.be.equal(strategy);
    });

    it('should inject multiple strategies in the constructor on instantiation', async () => {
      const context = new Context();
      const strategies = [new MockStrategy(), new MockStrategy2()];
      context.bind(AuthenticationBindings.STRATEGY).to(strategies);
      const provider = await instantiateClass(
        AuthenticateActionProvider,
        context,
      );
      expect(await provider.getStrategies()).to.deepEqual(strategies);
    });
  });

  describe('value()', () => {
    let provider: AuthenticateActionProvider;
    let strategy: MockStrategy;
    let strategy2: MockStrategy2;
    let currentUser: UserProfile | undefined;

    const mockUser: UserProfile = {name: 'user-name', [securityId]: 'mock-id'};

    beforeEach(() => {
      givenAuthenticateActionProvider();
    });

    it('returns a function which authenticates a request and returns a user', async () => {
      const authenticate: AuthenticateFn = await Promise.resolve(
        provider.value(),
      );
      const request = <Request>{};
      const user = await authenticate(request);
      expect(user).to.be.equal(mockUser);
    });

    it('updates current user', async () => {
      const authenticate = await Promise.resolve(provider.value());
      const request = <Request>{};
      await authenticate(request);
      expect(currentUser).to.equal(mockUser);
    });

    it('should return a function that throws an error if authentication fails', async () => {
      givenAuthenticateActionProvider([strategy]);
      const authenticate = await Promise.resolve(provider.value());
      const request = <Request>{};
      request.headers = {testState: 'fail'};

      await expect(authenticate(request)).to.be.rejected();
    });

    it('should return a function that throws an error if both authentication strategies fail', async () => {
      givenAuthenticateActionProvider([strategy, strategy2]);
      const authenticate = await Promise.resolve(provider.value());
      const request = <Request>{};
      request.headers = {testState: 'fail', testState2: 'fail'};

      await expect(authenticate(request)).to.be.rejected();
    });

    it('should return a function that does not throw an error if one authentication strategy succeeds', async () => {
      givenAuthenticateActionProvider([strategy, strategy2]);
      let authenticate = await Promise.resolve(provider.value());
      const request = <Request>{};
      request.headers = {testState: 'fail'};

      // 1st one fails
      await expect(authenticate(request)).to.not.be.rejected();

      givenAuthenticateActionProvider([strategy, strategy2]);
      authenticate = await Promise.resolve(provider.value());
      request.headers = {testState2: 'fail'};

      // 1st one succeeds but 2nd one fails
      await expect(authenticate(request)).to.not.be.rejected();
    });

    it('should return a function that throws an error if one authentication strategy fails', async () => {
      givenAuthenticateActionProvider([strategy, strategy2], {
        failOnError: true,
      });
      let authenticate = await Promise.resolve(provider.value());
      const request = <Request>{};
      request.headers = {testState: 'fail'};

      // 1st one fails
      await expect(authenticate(request)).to.be.rejected();

      givenAuthenticateActionProvider([strategy, strategy2], {
        failOnError: true,
      });
      authenticate = await Promise.resolve(provider.value());
      request.headers = {testState2: 'fail'};

      // 1st one succeeds but 2nd one fails
      await expect(authenticate(request)).to.not.be.rejected();
    });

    describe('context.get(provider_key)', () => {
      it('returns a function which authenticates a request and returns a user', async () => {
        const context: Context = new Context();
        context.bind(AuthenticationBindings.STRATEGY).to(strategy);
        context
          .bind(AuthenticationBindings.AUTH_ACTION)
          .toProvider(AuthenticateActionProvider);
        const request = <Request>{};
        const authenticate = await context.get<AuthenticateFn>(
          AuthenticationBindings.AUTH_ACTION,
        );
        const user: UserProfile | undefined = await authenticate(request);
        expect(user).to.be.equal(mockUser);
      });

      it('throws an error if the injected strategy is not valid', async () => {
        const context: Context = new Context();
        context
          .bind(AuthenticationBindings.STRATEGY)
          .to({} as AuthenticationStrategy);
        context
          .bind(AuthenticationBindings.AUTH_ACTION)
          .toProvider(AuthenticateActionProvider);
        const authenticate = await context.get<AuthenticateFn>(
          AuthenticationBindings.AUTH_ACTION,
        );
        const request = <Request>{};
        let error;
        try {
          await authenticate(request);
        } catch (exception) {
          error = exception;
        }
        expect(error).to.have.property(
          'message',
          'strategy.authenticate is not a function',
        );
      });

      it('throws Unauthorized error when authentication fails', async () => {
        const context: Context = new Context();
        context.bind(AuthenticationBindings.STRATEGY).to(strategy);
        context
          .bind(AuthenticationBindings.AUTH_ACTION)
          .toProvider(AuthenticateActionProvider);
        const authenticate = await context.get<AuthenticateFn>(
          AuthenticationBindings.AUTH_ACTION,
        );
        const request = <Request>{};
        request.headers = {testState: 'fail'};
        let error;
        try {
          await authenticate(request);
        } catch (err) {
          error = err;
        }
        expect(error).to.have.property('statusCode', 401);
      });

      it('throws USER_PROFILE_NOT_FOUND error when userprofile not returned', async () => {
        const context: Context = new Context();
        context.bind(AuthenticationBindings.STRATEGY).to(strategy);
        context
          .bind(AuthenticationBindings.AUTH_ACTION)
          .toProvider(AuthenticateActionProvider);
        const authenticate = await context.get<AuthenticateFn>(
          AuthenticationBindings.AUTH_ACTION,
        );
        const request = <Request>{};
        request.headers = {testState: 'empty'};
        let error;
        try {
          await authenticate(request);
        } catch (err) {
          error = err;
        }
        expect(error).to.have.property('code', 'USER_PROFILE_NOT_FOUND');
      });
    });

    function givenAuthenticateActionProvider(
      strategies?: AuthenticationStrategy[],
      options: AuthenticationOptions = {},
    ) {
      strategy = new MockStrategy();
      strategy.setMockUser(mockUser);
      strategy2 = new MockStrategy2();
      provider = new AuthenticateActionProvider(
        () => Promise.resolve(strategies ?? strategy),
        u => (currentUser = u),
        url => url,
        status => status,
        options,
      );
      currentUser = undefined;
    }
  });
});
