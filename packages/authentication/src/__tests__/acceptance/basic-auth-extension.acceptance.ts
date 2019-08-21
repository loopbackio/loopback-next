// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {Application} from '@loopback/core';
import {anOpenApiSpec} from '@loopback/openapi-spec-builder';
import {api, get} from '@loopback/openapi-v3';
import {Request, RestServer} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {Client, createClientForHandler} from '@loopback/testlab';
import {authenticate, registerAuthenticationStrategy} from '../..';
import {AuthenticationStrategy} from '../../types';
import {
  createBasicAuthorizationHeaderValue,
  getApp,
  getUserRepository,
} from '../fixtures/helper';
import {BasicAuthenticationStrategyBindings, USER_REPO} from '../fixtures/keys';
import {MyAuthenticationSequence} from '../fixtures/sequences/authentication.sequence';
import {BasicAuthenticationUserService} from '../fixtures/services/basic-auth-user-service';
import {BasicAuthenticationStrategy} from '../fixtures/strategies/basic-strategy';
import {User} from '../fixtures/users/user';
import {UserRepository} from '../fixtures/users/user.repository';

describe('Basic Authentication', () => {
  let app: Application;
  let server: RestServer;
  let users: UserRepository;
  let joeUser: User;
  beforeEach(givenAServer);
  beforeEach(givenControllerInApp);
  beforeEach(givenAuthenticatedSequence);
  beforeEach(givenProviders);

  it(`authenticates successfully for correct credentials of user 'jack'`, async () => {
    const client = whenIMakeRequestTo(server);
    await client
      .get('/whoAmI')
      .set('Authorization', createBasicAuthorizationHeaderValue(joeUser))
      .expect(joeUser.id);
  });

  it('returns error for missing Authorization header', async () => {
    const client = whenIMakeRequestTo(server);

    await client.get('/whoAmI').expect({
      error: {
        message: 'Authorization header not found.',
        name: 'UnauthorizedError',
        statusCode: 401,
      },
    });
  });

  it(`returns error for missing 'Basic ' portion of Authorization header value`, async () => {
    const client = whenIMakeRequestTo(server);
    await client
      .get('/whoAmI')
      .set(
        'Authorization',
        createBasicAuthorizationHeaderValue(joeUser, {prefix: 'NotB@sic '}),
      )
      .expect({
        error: {
          message: `Authorization header is not of type 'Basic'.`,
          name: 'UnauthorizedError',
          statusCode: 401,
        },
      });
  });

  it(`returns error for too many parts in Authorization header value`, async () => {
    const client = whenIMakeRequestTo(server);
    await client
      .get('/whoAmI')
      .set(
        'Authorization',
        createBasicAuthorizationHeaderValue(joeUser) + ' someOtherValue',
      )
      .expect({
        error: {
          message: `Authorization header value has too many parts. It must follow the pattern: 'Basic xxyyzz' where xxyyzz is a base64 string.`,
          name: 'UnauthorizedError',
          statusCode: 401,
        },
      });
  });

  it(`returns error for missing ':' in decrypted Authorization header credentials value`, async () => {
    const client = whenIMakeRequestTo(server);
    await client
      .get('/whoAmI')
      .set(
        'Authorization',
        createBasicAuthorizationHeaderValue(joeUser, {separator: '|'}),
      )
      .expect({
        error: {
          message: `Authorization header 'Basic' value does not contain two parts separated by ':'.`,
          name: 'UnauthorizedError',
          statusCode: 401,
        },
      });
  });

  it(`returns error for too many parts in decrypted Authorization header credentials value`, async () => {
    const client = whenIMakeRequestTo(server);
    await client
      .get('/whoAmI')
      .set(
        'Authorization',
        createBasicAuthorizationHeaderValue(joeUser, {
          extraSegment: 'extraPart',
        }),
      )
      .expect({
        error: {
          message: `Authorization header 'Basic' value does not contain two parts separated by ':'.`,
          name: 'UnauthorizedError',
          statusCode: 401,
        },
      });
  });

  it('allows anonymous requests to methods with no decorator', async () => {
    class InfoController {
      @get('/status')
      status() {
        return {running: true};
      }
    }

    app.controller(InfoController);
    await whenIMakeRequestTo(server)
      .get('/status')
      .expect(200, {running: true});
  });

  it('returns error for unknown authentication strategy', async () => {
    class InfoController {
      @get('/status')
      @authenticate('doesnotexist')
      status() {
        return {running: true};
      }
    }

    app.controller(InfoController);
    await whenIMakeRequestTo(server)
      .get('/status')
      .expect({
        error: {
          message: `The strategy 'doesnotexist' is not available.`,
          name: 'Error',
          statusCode: 401,
          code: 'AUTHENTICATION_STRATEGY_NOT_FOUND',
        },
      });
  });
  it('returns error when undefined user profile returned from authentication strategy', async () => {
    class BadBasicStrategy implements AuthenticationStrategy {
      name = 'badbasic';
      async authenticate(request: Request): Promise<UserProfile | undefined> {
        return undefined;
      }
    }
    registerAuthenticationStrategy(server, BadBasicStrategy);

    class InfoController {
      @get('/status')
      @authenticate('badbasic')
      status() {
        return {running: true};
      }
    }

    app.controller(InfoController);
    await whenIMakeRequestTo(server)
      .get('/status')
      .expect({
        error: {
          message: `User profile not returned from strategy's authenticate function`,
          name: 'Error',
          statusCode: 401,
          code: 'USER_PROFILE_NOT_FOUND',
        },
      });
  });
  async function givenAServer() {
    app = getApp();
    server = await app.getServer(RestServer);
  }

  function givenControllerInApp() {
    const apispec = anOpenApiSpec()
      .withOperation('get', '/whoAmI', {
        'x-operation-name': 'whoAmI',
        responses: {
          '200': {
            description: '',
            schema: {
              type: 'string',
            },
          },
        },
      })
      .build();

    @api(apispec)
    class MyController {
      constructor() {}

      @authenticate('basic')
      async whoAmI(
        @inject(SecurityBindings.USER) userProfile: UserProfile,
      ): Promise<string> {
        if (!userProfile) return 'userProfile is undefined';
        if (!userProfile[securityId]) return 'userProfile id is undefined';
        return userProfile[securityId];
      }
    }
    app.controller(MyController);
  }

  function givenAuthenticatedSequence() {
    // bind user defined sequence
    server.sequence(MyAuthenticationSequence);
  }

  function givenProviders() {
    registerAuthenticationStrategy(server, BasicAuthenticationStrategy);

    server
      .bind(BasicAuthenticationStrategyBindings.USER_SERVICE)
      .toClass(BasicAuthenticationUserService);

    users = getUserRepository();
    joeUser = users.list['joe888'];
    server.bind(USER_REPO).to(users);
  }

  function whenIMakeRequestTo(restServer: RestServer): Client {
    return createClientForHandler(restServer.requestHandler);
  }
});
