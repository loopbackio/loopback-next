// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
import {createBindingFromClass, inject} from '@loopback/context';
import {Application} from '@loopback/core';
import {get} from '@loopback/openapi-v3';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  RestComponent,
  RestServer,
  Send,
  SequenceHandler,
} from '@loopback/rest';
import {Client, createClientForHandler, expect} from '@loopback/testlab';
import {
  authenticate,
  AuthenticateFn,
  AuthenticationBindings,
  AuthenticationComponent,
  UserProfile,
} from '../..';
import {AuthenticateActionProvider} from '../fixtures/authentication-action-provider/authentication-action.provider';
import {JWTAuthenticationStrategyBindings, USER_REPO} from '../fixtures/keys';
import {JWTService} from '../fixtures/services/jwt-service';
import {JWTAuthenticationStrategy} from '../fixtures/strategies/jwt-strategy';
import {StrategyResolverProvider} from '../fixtures/strategy-resolver/strategy.resolver';
import {UserRepository} from '../fixtures/users/user.repository';

const SequenceActions = RestBindings.SequenceActions;

describe('JWT Authentication', () => {
  let app: Application;
  let server: RestServer;
  let users: UserRepository;

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

      @get('/login')
      logIn() {
        //
        // ...Other code for verifying a valid user (e.g. basic or local strategy)...
        //

        // Now with a valid userProfile, let's create a JSON web token
        const joeUser = this.users.list['joe@example.com'].user;

        const joeUserProfile = {
          id: joeUser.id,
          email: joeUser.email,
          name: `${joeUser.firstname} ${joeUser.surname}`,
        };

        return this.tokenService.generateToken(joeUserProfile).then(token => {
          return token;
        });
      }

      @get('/whoAmI')
      @authenticate('jwt')
      whoAmI(
        @inject(AuthenticationBindings.CURRENT_USER) userProfile: UserProfile,
      ) {
        if (userProfile) {
          if (userProfile.email) return userProfile.email;
          else return 'userProfile email is undefined';
        } //if
        else return 'userProfile is undefined';
      }
    }

    app.controller(InfoController);

    const token: string = (await whenIMakeRequestTo(server)
      .get('/login')
      .expect(200)).text;

    expect(token).to.be.not.Null;
    expect(token).to.be.String;

    const email = (await whenIMakeRequestTo(server)
      .get('/whoAmI')
      .set('access_token', token)
      .expect(200)).text;

    expect(email).to.equal(users.list['joe@example.com'].user.email);
  });

  it('returns error due to expired token', async () => {
    class InfoController {
      constructor() {}

      @get('/whoAmI')
      @authenticate('jwt')
      whoAmI(
        @inject(AuthenticationBindings.CURRENT_USER) userProfile: UserProfile,
      ) {
        if (userProfile) {
          if (userProfile.email) return userProfile.email;
          else return 'userProfile email is undefined';
        } //if
        else return 'userProfile is undefined';
      }
    }

    app.controller(InfoController);

    const expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImpvZUBleGFtcGxlLmNvbSIsIm5hbWUiOiJqb2Ugam9lbWFuIiwiaWF0IjoxNTU1ODY3NDAzLCJleHAiOjE1NTU4Njc0NjN9.QKmO5qDC8Yg-aK3EedLRsXczL7VQDDnWtA-cpyqszqM';

    await whenIMakeRequestTo(server)
      .get('/whoAmI')
      .set('access_token', expiredToken)
      .expect(401);
  });

  it('returns error due to invalid token #1', async () => {
    class InfoController {
      constructor() {}

      @get('/whoAmI')
      @authenticate('jwt')
      whoAmI(
        @inject(AuthenticationBindings.CURRENT_USER) userProfile: UserProfile,
      ) {
        if (userProfile) {
          if (userProfile.email) return userProfile.email;
          else return 'userProfile email is undefined';
        } //if
        else return 'userProfile is undefined';
      }
    }

    app.controller(InfoController);

    const invalidToken = 'aaa.bbb.ccc';

    await whenIMakeRequestTo(server)
      .get('/whoAmI')
      .set('access_token', invalidToken)
      .expect(401);
  });

  it('returns error due to invalid token #2', async () => {
    class InfoController {
      constructor() {}

      @get('/whoAmI')
      @authenticate('jwt')
      whoAmI(
        @inject(AuthenticationBindings.CURRENT_USER) userProfile: UserProfile,
      ) {
        if (userProfile) {
          if (userProfile.email) return userProfile.email;
          else return 'userProfile email is undefined';
        } //if
        else return 'userProfile is undefined';
      }
    }

    app.controller(InfoController);

    const invalidToken = 'aaa.bbb.ccc.ddd';

    await whenIMakeRequestTo(server)
      .get('/whoAmI')
      .set('access_token', invalidToken)
      .expect(401);
  });

  it('create a json web token throws error for missing email', async () => {
    class InfoController {
      constructor(
        @inject(JWTAuthenticationStrategyBindings.TOKEN_SERVICE)
        public tokenService: JWTService,
        @inject(USER_REPO)
        public users: UserRepository,
      ) {}

      @get('/createtoken')
      createToken() {
        const joeUser = this.users.list['joe@example.com'].user;

        const joeUserProfile = {
          id: joeUser.id,
          email: undefined,
          name: `${joeUser.firstname} ${joeUser.surname}`,
        };

        return this.tokenService.generateToken(joeUserProfile).then(token => {
          return {token};
        });
      }
    }

    app.controller(InfoController);

    await whenIMakeRequestTo(server)
      .get('/createtoken')
      .expect(401);
  });

  it('create a json web token throws error for missing name', async () => {
    class InfoController {
      constructor(
        @inject(JWTAuthenticationStrategyBindings.TOKEN_SERVICE)
        public tokenService: JWTService,
        @inject(USER_REPO)
        public users: UserRepository,
      ) {}

      @get('/createtoken')
      createToken() {
        const joeUser = this.users.list['joe@example.com'].user;

        const joeUserProfile = {
          id: joeUser.id,
          email: joeUser.email,
          name: undefined,
        };

        return this.tokenService.generateToken(joeUserProfile).then(token => {
          return {token};
        });
      }
    }

    app.controller(InfoController);

    await whenIMakeRequestTo(server)
      .get('/createtoken')
      .expect(401);
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

  async function givenAServer() {
    app = new Application();
    app.component(AuthenticationComponent);
    app.component(RestComponent);
    server = await app.getServer(RestServer);
  }

  function givenAuthenticatedSequence() {
    class MySequence implements SequenceHandler {
      constructor(
        @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
        @inject(SequenceActions.PARSE_PARAMS)
        protected parseParams: ParseParams,
        @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
        @inject(SequenceActions.SEND) protected send: Send,
        @inject(SequenceActions.REJECT) protected reject: Reject,
        @inject(AuthenticationBindings.AUTH_ACTION)
        protected authenticateRequest: AuthenticateFn,
      ) {}

      async handle(context: RequestContext) {
        try {
          const {request, response} = context;
          const route = this.findRoute(request);

          // Authenticate
          await this.authenticateRequest(request);

          // Authentication successful, proceed to invoke controller
          const args = await this.parseParams(request, route);
          const result = await this.invoke(route, args);
          this.send(response, result);
        } catch (error) {
          this.reject(context, error);
          return;
        }
      }
    }
    // bind user defined sequence
    server.sequence(MySequence);
  }

  function givenProviders() {
    server
      .bind(AuthenticationBindings.STRATEGY)
      .toProvider(StrategyResolverProvider);

    server
      .bind(AuthenticationBindings.AUTH_ACTION)
      .toProvider(AuthenticateActionProvider);

    server.add(createBindingFromClass(JWTAuthenticationStrategy));

    server
      .bind(JWTAuthenticationStrategyBindings.TOKEN_SECRET)
      .to('myjwts3cr3t');

    server.bind(JWTAuthenticationStrategyBindings.TOKEN_EXPIRES_IN).to('60');

    server
      .bind(JWTAuthenticationStrategyBindings.TOKEN_SERVICE)
      .toClass(JWTService);

    users = new UserRepository({
      'joe@example.com': {
        user: {
          id: '1',
          firstname: 'joe',
          surname: 'joeman',
          email: 'joe@example.com',
          password: 'joepa55w0rd',
        },
      },
      'jill@example.com': {
        user: {
          id: '2',
          firstname: 'jill',
          surname: 'jillman',
          email: 'jill@example.com',
          password: 'jillpa55w0rd',
        },
      },
      'jack@example.com': {
        user: {
          id: '3',
          firstname: 'jack',
          surname: 'jackman',
          email: 'jack@example.com',
          password: 'jackpa55w0rd',
        },
      },
      'janice@example.com': {
        user: {
          id: '4',
          firstname: 'janice',
          surname: 'janiceman',
          email: 'janice@example.com',
          password: 'janicepa55w0rd',
        },
      },
    });

    server.bind(USER_REPO).to(users);
  }

  function whenIMakeRequestTo(restServer: RestServer): Client {
    return createClientForHandler(restServer.requestHandler);
  }
});
