// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, instantiateClass} from '@loopback/context';
import {Request} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {expect} from '@loopback/testlab';
import {AuthenticateFn, AuthenticationBindings} from '../../..';
import {AuthenticateActionProvider} from '../../../providers';
import {AuthenticationStrategy} from '../../../types';
import {MockStrategy} from '../fixtures/mock-strategy';

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
      expect(await provider.getStrategy()).to.be.equal(strategy);
    });
  });

  describe('value()', () => {
    let provider: AuthenticateActionProvider;
    let strategy: MockStrategy;
    let currentUser: UserProfile | undefined;

    const mockUser: UserProfile = {name: 'user-name', [securityId]: 'mock-id'};

    beforeEach(givenAuthenticateActionProvider);

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
    });

    function givenAuthenticateActionProvider() {
      strategy = new MockStrategy();
      strategy.setMockUser(mockUser);
      provider = new AuthenticateActionProvider(
        () => Promise.resolve(strategy),
        u => (currentUser = u),
      );
      currentUser = undefined;
    }
  });
});
