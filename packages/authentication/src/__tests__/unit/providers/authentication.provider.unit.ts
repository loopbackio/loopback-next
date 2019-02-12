// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, instantiateClass} from '@loopback/context';
import {Request} from '@loopback/rest';
import {AuthenticateFn, UserProfile, AuthenticationBindings} from '../../..';
import {MockStrategy} from '../fixtures/mock-strategy';
import {Strategy} from 'passport';
import {AuthenticateActionProvider} from '../../../providers';

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

    const mockUser: UserProfile = {name: 'user-name', id: 'mock-id'};

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

      it('throws an error if the injected passport strategy is not valid', async () => {
        const context: Context = new Context();
        context.bind(AuthenticationBindings.STRATEGY).to({} as Strategy);
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
        expect(error).to.have.property('message', 'invalid strategy parameter');
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
