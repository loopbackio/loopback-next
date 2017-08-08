// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, Provider, instantiateClass} from '@loopback/context';
import {ParsedRequest} from '@loopback/core';
import {
  AuthenticationProvider,
  AuthenticateFn,
  UserProfile,
  BindingKeys,
} from '../..';
import {MockStrategy} from './fixtures/mock-strategy';

describe('AuthenticationProvider', () => {
  describe('constructor()', () => {
    it('instantiateClass injects authentication.strategy in the constructor',
    async () => {
      const context = new Context();
      const strategy = new MockStrategy();
      context.bind(BindingKeys.Authentication.STRATEGY).to(strategy);
      const provider = await instantiateClass(AuthenticationProvider, context);
      expect(await provider.getStrategy()).to.be.equal(strategy);
    });
  });

  describe('value()', () => {
    let provider: AuthenticationProvider;
    let strategy: MockStrategy;
    let currentUser: UserProfile | undefined;

    const mockUser: UserProfile = {name: 'user-name', id: 'mock-id'};

    beforeEach(givenAuthenticationProvider);

    it('returns a function which authenticates a request and returns a user',
    async () => {
      const authenticate: AuthenticateFn = await Promise.resolve(
        provider.value(),
      );
      const request = <ParsedRequest> {};
      const user: UserProfile = await authenticate(request);
      expect(user).to.be.equal(mockUser);
    });

   it('updates current user', async () => {
     const authenticate = await Promise.resolve(provider.value());
     const request = <ParsedRequest> {};
     await authenticate(request);
     expect(currentUser).to.equal(mockUser);
   });

    describe('context.get(provider_key)', () => {
      it('returns a function which authenticates a request and returns a user',
      async () => {
        const context: Context = new Context();
        context.bind(BindingKeys.Authentication.STRATEGY).to(strategy);
        context
          .bind(BindingKeys.Authentication.AUTH_ACTION)
          .toProvider(AuthenticationProvider);
        const request = <ParsedRequest> {};
        const authenticate = await context.get(
          BindingKeys.Authentication.AUTH_ACTION,
        );
        const user: UserProfile = await authenticate(request);
        expect(user).to.be.equal(mockUser);
      });

      it('throws an error if the injected passport strategy is not valid',
      async () => {
        const context: Context = new Context();
        context.bind(BindingKeys.Authentication.STRATEGY).to({});
        context
          .bind(BindingKeys.Authentication.AUTH_ACTION)
          .toProvider(AuthenticationProvider);
        const authenticate = await context.get(
          BindingKeys.Authentication.AUTH_ACTION,
        );
        const request = <ParsedRequest> {};
        let error;
        try {
          await authenticate(request);
        } catch (exception) {
          error = exception;
        }
        expect(error).to.have.property('message', 'invalid strategy parameter');
      });

      it('throws Unauthorized error when authentication fails',
      async () => {
        const context: Context = new Context();
        context.bind(BindingKeys.Authentication.STRATEGY).to(strategy);
        context
          .bind(BindingKeys.Authentication.AUTH_ACTION)
          .toProvider(AuthenticationProvider);
        const authenticate = await context.get(
          BindingKeys.Authentication.AUTH_ACTION,
        );
        const request = <ParsedRequest> {};
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

    function givenAuthenticationProvider() {
      strategy = new MockStrategy();
      strategy.setMockUser(mockUser);
      provider = new AuthenticationProvider(
        () => Promise.resolve(strategy),
        u => currentUser = u);
      currentUser = undefined;
    }
  });
});
