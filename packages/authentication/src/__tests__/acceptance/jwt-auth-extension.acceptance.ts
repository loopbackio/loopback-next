// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {Application} from '@loopback/core';
import {get, post} from '@loopback/openapi-v3';
import {Request, RestServer} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {Client, createClientForHandler, expect} from '@loopback/testlab';
import {
  authenticate,
  AuthenticationStrategy,
  registerAuthenticationStrategy,
} from '../..';
import {
  createBearerAuthorizationHeaderValue,
  createUserProfile,
  getApp,
  getUserRepository,
} from '../fixtures/helper';
import {JWTAuthenticationStrategyBindings, USER_REPO} from '../fixtures/keys';
import {MyAuthenticationSequence} from '../fixtures/sequences/authentication.sequence';
import {JWTService} from '../fixtures/services/jwt-service';
import {JWTAuthenticationStrategy} from '../fixtures/strategies/jwt-strategy';
import {User} from '../fixtures/users/user';
import {UserRepository} from '../fixtures/users/user.repository';

describe('JWT Authentication', () => {
  let app: Application;
  let server: RestServer;
  let testUsers: UserRepository;
  let joeUser: User;
  let token: string;
  const TOKEN_SECRET_VALUE = 'myjwts3cr3t';
  const TOKEN_EXPIRES_IN_VALUE = '600';

  beforeEach(givenAServer);
  beforeEach(givenAuthenticatedSequence);
  beforeEach(givenProviders);

  it('authenticates successfully with valid token', async () => {
    class InfoController {
      constructor(
        @inject(JWTAuthenticationStrategyBindings.TOKEN_SERVICE)
        public tokenService: JWTService,
        @inject(USER_REPO)
        public users: UserRepository,
      ) {}

      @post('/login')
      async logIn() {
        //
        // ...Other code for verifying a valid user (e.g. basic or local strategy)...
        //

        // Now with a valid userProfile, let's create a JSON web token
        return this.tokenService.generateToken(createUserProfile(joeUser));
      }

      @get('/whoAmI')
      @authenticate('jwt')
      whoAmI(@inject(SecurityBindings.USER) userProfile: UserProfile) {
        if (!userProfile) return 'userProfile is undefined';
        if (!userProfile[securityId])
          return 'userProfile securityId is undefined';
        return userProfile[securityId];
      }
    }

    app.controller(InfoController);

    token = (await whenIMakeRequestTo(server)
      .post('/login')
      .expect(200)).text;

    expect(token).to.be.not.null();
    expect(token).to.be.String();

    const id = (await whenIMakeRequestTo(server)
      .get('/whoAmI')
      .set('Authorization', createBearerAuthorizationHeaderValue(token))
      .expect(200)).text;

    expect(id).to.equal(joeUser.id);
  });

  it(`returns error for missing Authorization header`, async () => {
    class InfoController {
      constructor(
        @inject(JWTAuthenticationStrategyBindings.TOKEN_SERVICE)
        public tokenService: JWTService,
        @inject(USER_REPO)
        public users: UserRepository,
      ) {}

      @post('/login')
      async logIn() {
        //
        // ...Other code for verifying a valid user (e.g. basic or local strategy)...
        //

        // Now with a valid userProfile, let's create a JSON web token
        return this.tokenService.generateToken(createUserProfile(joeUser));
      }

      @get('/whoAmI')
      @authenticate('jwt')
      whoAmI(@inject(SecurityBindings.USER) userProfile: UserProfile) {
        if (!userProfile) return 'userProfile is undefined';
        if (!userProfile.id) return 'userProfile id is undefined';
        return userProfile.id;
      }
    }

    app.controller(InfoController);

    token = (await whenIMakeRequestTo(server)
      .post('/login')
      .expect(200)).text;

    expect(token).to.be.not.null();
    expect(token).to.be.String();

    await whenIMakeRequestTo(server)
      .get('/whoAmI')
      .expect({
        error: {
          message: 'Authorization header not found.',
          name: 'UnauthorizedError',
          statusCode: 401,
        },
      });
  });

  it(`returns error for invalid 'Bearer ' portion of Authorization header value`, async () => {
    class InfoController {
      constructor(
        @inject(JWTAuthenticationStrategyBindings.TOKEN_SERVICE)
        public tokenService: JWTService,
        @inject(USER_REPO)
        public users: UserRepository,
      ) {}

      @post('/login')
      async logIn() {
        //
        // ...Other code for verifying a valid user (e.g. basic or local strategy)...
        //

        // Now with a valid userProfile, let's create a JSON web token
        return this.tokenService.generateToken(createUserProfile(joeUser));
      }

      @get('/whoAmI')
      @authenticate('jwt')
      whoAmI(@inject(SecurityBindings.USER) userProfile: UserProfile) {
        if (!userProfile) return 'userProfile is undefined';
        if (!userProfile.id) return 'userProfile id is undefined';
        return userProfile.id;
      }
    }

    app.controller(InfoController);

    token = (await whenIMakeRequestTo(server)
      .post('/login')
      .expect(200)).text;

    expect(token).to.be.not.null();
    expect(token).to.be.String();

    await whenIMakeRequestTo(server)
      .get('/whoAmI')
      .set(
        'Authorization',
        createBearerAuthorizationHeaderValue(token, 'NotB3ar3r '),
      )
      .expect({
        error: {
          message: `Authorization header is not of type 'Bearer'.`,
          name: 'UnauthorizedError',
          statusCode: 401,
        },
      });
  });

  it(`returns error for too many parts in Authorization header value`, async () => {
    class InfoController {
      constructor(
        @inject(JWTAuthenticationStrategyBindings.TOKEN_SERVICE)
        public tokenService: JWTService,
        @inject(USER_REPO)
        public users: UserRepository,
      ) {}

      @post('/login')
      async logIn() {
        //
        // ...Other code for verifying a valid user (e.g. basic or local strategy)...
        //

        return this.tokenService.generateToken(createUserProfile(joeUser));
      }

      @get('/whoAmI')
      @authenticate('jwt')
      whoAmI(@inject(SecurityBindings.USER) userProfile: UserProfile) {
        if (!userProfile) return 'userProfile is undefined';
        if (!userProfile.id) return 'userProfile id is undefined';
        return userProfile.id;
      }
    }

    app.controller(InfoController);

    token = (await whenIMakeRequestTo(server)
      .post('/login')
      .expect(200)).text;

    expect(token).to.be.not.null();
    expect(token).to.be.String();

    await whenIMakeRequestTo(server)
      .get('/whoAmI')
      .set(
        'Authorization',
        createBearerAuthorizationHeaderValue(token) + ' someOtherValue',
      )
      .expect({
        error: {
          message: `Authorization header value has too many parts. It must follow the pattern: 'Bearer xx.yy.zz' where xx.yy.zz is a valid JWT token.`,
          name: 'UnauthorizedError',
          statusCode: 401,
        },
      });
  });

  it('returns error due to expired token', async () => {
    class InfoController {
      constructor() {}

      @get('/whoAmI')
      @authenticate('jwt')
      whoAmI(@inject(SecurityBindings.USER) userProfile: UserProfile) {
        if (!userProfile) return 'userProfile is undefined';
        if (!userProfile.id) return 'userProfile id is undefined';
        return userProfile.id;
      }
    }

    app.controller(InfoController);

    const expiredToken = await getExpiredToken();

    await whenIMakeRequestTo(server)
      .get('/whoAmI')
      .set('Authorization', createBearerAuthorizationHeaderValue(expiredToken))
      .expect({
        error: {
          message: `Error verifying token : jwt expired`,
          name: 'UnauthorizedError',
          statusCode: 401,
        },
      });
  });

  it('returns error due to invalid token #1', async () => {
    class InfoController {
      constructor() {}

      @get('/whoAmI')
      @authenticate('jwt')
      whoAmI(@inject(SecurityBindings.USER) userProfile: UserProfile) {
        if (!userProfile) return 'userProfile is undefined';
        if (!userProfile.id) return 'userProfile id is undefined';
        return userProfile.id;
      }
    }

    app.controller(InfoController);

    const invalidToken = 'aaa.bbb.ccc';

    await whenIMakeRequestTo(server)
      .get('/whoAmI')
      .set('Authorization', createBearerAuthorizationHeaderValue(invalidToken))
      .expect({
        error: {
          message: 'Error verifying token : invalid token',
          name: 'UnauthorizedError',
          statusCode: 401,
        },
      });
  });

  it('returns error due to invalid token #2', async () => {
    class InfoController {
      constructor() {}

      @get('/whoAmI')
      @authenticate('jwt')
      whoAmI(@inject(SecurityBindings.USER) userProfile: UserProfile) {
        if (!userProfile) return 'userProfile is undefined';
        if (!userProfile.id) return 'userProfile id is undefined';
        return userProfile.id;
      }
    }

    app.controller(InfoController);

    const invalidToken = 'aaa.bbb.ccc.ddd';

    await whenIMakeRequestTo(server)
      .get('/whoAmI')
      .set('Authorization', createBearerAuthorizationHeaderValue(invalidToken))
      .expect({
        error: {
          message: 'Error verifying token : jwt malformed',
          name: 'UnauthorizedError',
          statusCode: 401,
        },
      });
  });

  it('creates a json web token and throws error for userProfle that is undefined', async () => {
    class InfoController {
      constructor(
        @inject(JWTAuthenticationStrategyBindings.TOKEN_SERVICE)
        public tokenService: JWTService,
        @inject(USER_REPO)
        public users: UserRepository,
      ) {}

      @get('/createtoken')
      async createToken() {
        return this.tokenService.generateToken(undefined);
      }
    }

    app.controller(InfoController);

    await whenIMakeRequestTo(server)
      .get('/createtoken')
      .expect({
        error: {
          message: `Error generating token : userProfile is null`,
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
    class BadJWTStrategy implements AuthenticationStrategy {
      name = 'badjwt';
      async authenticate(request: Request): Promise<UserProfile | undefined> {
        return undefined;
      }
    }
    registerAuthenticationStrategy(server, BadJWTStrategy);

    class InfoController {
      @get('/status')
      @authenticate('badjwt')
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

  /**
   * Creates an expired token
   *
   * Specifying a negative value for 'expiresIn' so the
   * token is automatically expired
   */
  async function getExpiredToken() {
    const userProfile = createUserProfile(joeUser);
    const tokenService = new JWTService(TOKEN_SECRET_VALUE, '-10');
    return tokenService.generateToken(userProfile);
  }

  function givenAuthenticatedSequence() {
    // bind user defined sequence
    server.sequence(MyAuthenticationSequence);
  }

  function givenProviders() {
    registerAuthenticationStrategy(server, JWTAuthenticationStrategy);

    server
      .bind(JWTAuthenticationStrategyBindings.TOKEN_SECRET)
      .to(TOKEN_SECRET_VALUE);

    server
      .bind(JWTAuthenticationStrategyBindings.TOKEN_EXPIRES_IN)
      .to(TOKEN_EXPIRES_IN_VALUE);

    server
      .bind(JWTAuthenticationStrategyBindings.TOKEN_SERVICE)
      .toClass(JWTService);

    testUsers = getUserRepository();
    joeUser = testUsers.list['joe888'];
    server.bind(USER_REPO).to(testUsers);
  }

  function whenIMakeRequestTo(restServer: RestServer): Client {
    return createClientForHandler(restServer.requestHandler);
  }
});
