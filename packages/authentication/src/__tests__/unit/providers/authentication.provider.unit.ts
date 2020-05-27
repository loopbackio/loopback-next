// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, instantiateClass} from '@loopback/context';
import {Middleware, MiddlewareContext} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {expect, stubExpressContext} from '@loopback/testlab';
import {AuthenticationBindings} from '../../..';
import {AuthenticationMiddlewareProvider} from '../../../providers';
import {AuthenticationStrategy} from '../../../types';
import {MockStrategy} from '../fixtures/mock-strategy';

describe('AuthenticationMiddlewareProvider', () => {
  describe('constructor()', () => {
    it('instantiateClass injects authentication.strategy in the constructor', async () => {
      const context = new Context();
      const strategy = new MockStrategy();
      context.bind(AuthenticationBindings.STRATEGY).to(strategy);
      const provider = await instantiateClass(
        AuthenticationMiddlewareProvider,
        context,
      );
      expect(await provider.getStrategy()).to.be.equal(strategy);
    });
  });

  describe('value()', () => {
    let provider: AuthenticationMiddlewareProvider;
    let strategy: MockStrategy;
    let currentUser: UserProfile | undefined;

    const mockUser: UserProfile = {name: 'user-name', [securityId]: 'mock-id'};

    beforeEach(givenAuthenticationMiddlewareProvider);

    it('returns a function which authenticates a request and returns a user', async () => {
      const request = givenRequest();
      const user = await provider.action(request);
      expect(user).to.be.equal(mockUser);
    });

    it('updates current user', async () => {
      const request = givenRequest();
      await provider.action(request);
      expect(currentUser).to.equal(mockUser);
    });

    describe('context.get(provider_key)', () => {
      it('returns a function which authenticates a request and returns a user', async () => {
        const context: Context = new Context();
        context.bind(AuthenticationBindings.STRATEGY).to(strategy);
        context
          .bind(AuthenticationBindings.AUTHENTICATION_MIDDLEWARE)
          .toProvider(AuthenticationMiddlewareProvider);
        const user: UserProfile | undefined = await invokeAuthMiddleware(
          context,
        );
        expect(user).to.be.equal(mockUser);
      });

      it('throws an error if the injected strategy is not valid', async () => {
        const context: Context = new Context();
        context
          .bind(AuthenticationBindings.STRATEGY)
          .to({} as AuthenticationStrategy);
        context
          .bind(AuthenticationBindings.AUTHENTICATION_MIDDLEWARE)
          .toProvider(AuthenticationMiddlewareProvider);

        let error;
        try {
          await invokeAuthMiddleware(context);
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
          .bind(AuthenticationBindings.AUTHENTICATION_MIDDLEWARE)
          .toProvider(AuthenticationMiddlewareProvider);

        let error;
        try {
          await invokeAuthMiddleware(context, {testState: 'fail'});
        } catch (err) {
          error = err;
        }
        expect(error).to.have.property('statusCode', 401);
      });

      it('throws USER_PROFILE_NOT_FOUND error when userprofile not returned', async () => {
        const context: Context = new Context();
        context.bind(AuthenticationBindings.STRATEGY).to(strategy);
        context
          .bind(AuthenticationBindings.AUTHENTICATION_MIDDLEWARE)
          .toProvider(AuthenticationMiddlewareProvider);
        let error;
        try {
          await invokeAuthMiddleware(context, {testState: 'empty'});
        } catch (err) {
          error = err;
        }
        expect(error).to.have.property('code', 'USER_PROFILE_NOT_FOUND');
      });
    });

    function givenAuthenticationMiddlewareProvider() {
      strategy = new MockStrategy();
      strategy.setMockUser(mockUser);
      provider = new AuthenticationMiddlewareProvider(
        () => Promise.resolve(strategy),
        u => (currentUser = u),
        url => url,
        status => status,
      );
      currentUser = undefined;
    }

    function givenRequest() {
      const stub = stubExpressContext({url: '/'});
      return stub.request;
    }

    function givenMiddlewareContext(parent: Context): MiddlewareContext {
      const stub = stubExpressContext({url: '/'});
      return new MiddlewareContext(stub.request, stub.response, parent);
    }

    async function invokeAuthMiddleware(
      context: Context,
      headers: Record<string, string> = {},
    ) {
      const middlewareCtx = givenMiddlewareContext(context);
      for (const h in headers) {
        middlewareCtx.request.headers[h] = headers[h];
      }
      const middleware = await context.get<Middleware>(
        AuthenticationBindings.AUTHENTICATION_MIDDLEWARE,
      );
      const user: UserProfile | undefined = (await middleware(
        middlewareCtx,
        () => undefined,
      )) as UserProfile | undefined;
      return user;
    }
  });
});
