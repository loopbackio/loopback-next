// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/authentication-passport
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  authenticate,
  AuthenticateFn,
  AuthenticationBindings,
  AuthenticationComponent,
  AuthenticationStrategy,
  AUTHENTICATION_STRATEGY_NOT_FOUND,
  UserProfileFactory,
  USER_PROFILE_NOT_FOUND,
} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {addExtension, CoreTags, Provider} from '@loopback/core';
import {anOpenApiSpec} from '@loopback/openapi-spec-builder';
import {api, get} from '@loopback/openapi-v3';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext,
  RestApplication,
  RestBindings,
  RestServer,
  Send,
  SequenceHandler,
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {Client, createClientForHandler} from '@loopback/testlab';
import {BasicStrategy, BasicVerifyFunction} from 'passport-http';
import {StrategyAdapter} from '../../strategy-adapter';

const SequenceActions = RestBindings.SequenceActions;
const AUTH_STRATEGY_NAME = 'basic';
const INVALID_USER_CREDENTIALS_MESSAGE = 'Invalid credentials';
const INVALID_USER_CREDENTIALS_CODE = 'INVALID_USER_CREDENTIALS';
const USERS_REPOSITORY_BINDING_KEY = 'repositories.users';
const VERIFY_FUNCTION_BASIC_AUTHENTICATION_BINDING_KEY =
  'authentication.basic.verify';
const BASIC_STRATEGY_BINDING_KEY =
  'authentication.strategies.basicAuthStrategy';

enum ScenarioEnum {
  WithoutProviders,
  WithProviders,
}

describe('Basic Authentication', () => {
  let app: RestApplication;
  let server: RestServer;
  let users: UserRepository;

  //these setup steps are the same regardless of which scenario ( with or without providers)
  beforeEach(givenAnApp);
  beforeEach(givenUserRepository);
  beforeEach(givenControllerInApp);

  it('authenticates successfully for correct credentials', async () => {
    await remainingSetup(ScenarioEnum.WithoutProviders);
    const client = whenIMakeRequestTo(server);
    const credential =
      users.list.Joseph.profile.username + ':' + users.list.Joseph.password;
    const hash = Buffer.from(credential).toString('base64');
    await client
      .get('/whoAmI')
      .set('Authorization', 'Basic ' + hash)
      .expect(users.list.Joseph.profile.id);
  });

  it('returns error for invalid credentials', async () => {
    await remainingSetup(ScenarioEnum.WithoutProviders);
    const client = whenIMakeRequestTo(server);
    const credential = users.list.Simon.profile.username + ':' + 'invalid';
    const hash = Buffer.from(credential).toString('base64');
    await client
      .get('/whoAmI')
      .set('Authorization', 'Basic ' + hash)
      .expect(401);
  });

  it(`allows anonymous requests to methods with no 'authenticate' decorator`, async () => {
    class InfoController {
      @get('/status')
      status() {
        return {running: true};
      }
    }

    app.controller(InfoController); //overriding 'beforeEach(givenControllerInApp);' above
    await remainingSetup(ScenarioEnum.WithoutProviders);
    await whenIMakeRequestTo(server)
      .get('/status')
      .expect(200, {running: true});
  });

  it('Using provider - authenticates successfully for correct credentials', async () => {
    await remainingSetup(ScenarioEnum.WithProviders);
    const client = whenIMakeRequestTo(server);
    const credential =
      users.list.Joseph.profile.username + ':' + users.list.Joseph.password;
    const hash = Buffer.from(credential).toString('base64');
    await client
      .get('/whoAmI')
      .set('Authorization', 'Basic ' + hash)
      .expect(users.list.Joseph.profile.id);
  });

  it('Using provider - returns error for invalid credentials', async () => {
    await remainingSetup(ScenarioEnum.WithProviders);
    const client = whenIMakeRequestTo(server);
    const credential = users.list.Simon.profile.username + ':' + 'invalid';
    const hash = Buffer.from(credential).toString('base64');
    await client
      .get('/whoAmI')
      .set('Authorization', 'Basic ' + hash)
      .expect(401);
  });

  it(`Using provider - allows anonymous requests to methods with no 'authenticate' decorator`, async () => {
    class InfoController {
      @get('/status')
      status() {
        return {running: true};
      }
    }

    app.controller(InfoController); //overriding 'beforeEach(givenControllerInApp);' above
    await remainingSetup(ScenarioEnum.WithProviders);
    await whenIMakeRequestTo(server)
      .get('/status')
      .expect(200, {running: true});
  });

  async function givenAnApp() {
    app = new RestApplication();
    app.component(AuthenticationComponent);
  }

  function givenUserRepository() {
    users = new UserRepository({
      Joseph: {
        profile: {
          id: '1',
          username: 'joesmith71',
          firstName: 'Joseph',
          lastName: 'Smith',
        },
        password: '12345',
      },
      Simon: {
        profile: {
          id: '2',
          username: 'simonsmith71',
          firstName: 'Simon',
          lastName: 'Smith',
        },
        password: 'alpha',
      },
      Flint: {
        profile: {
          id: '3',
          username: 'flintsmith71',
          firstName: 'Flint',
          lastName: 'Smith',
        },
        password: 'beta',
      },
      Curious: {
        profile: {
          id: '4',
          username: 'curioussmith71',
          firstName: 'Curious',
          lastName: 'Smith',
        },
        password: 'gamma',
      },
    });
  }

  // Since it has to be user's job to provide the `verify` function and
  // instantiate the passport strategy, we cannot add the imported `BasicStrategy`
  // class as extension directly.
  // We need to either wrap it as a strategy provider, and add the provider
  // class as the extension. (When having something like the verify function to inject)
  // Or just wrap the basic strategy instance and bind it to the app. (When nothing to inject)

  function verify(username: string, password: string, cb: Function) {
    users.find(username, password, cb);
  }

  //
  // The purpose of this function is to convert
  // a user instance into a user profile instance.
  // (A user profile should contain less data than a user)
  //
  const myUserProfileFactory: UserProfileFactory<MyUser> = function (
    user: MyUser,
  ): UserProfile {
    const userProfile = {[securityId]: user.id};
    return userProfile;
  };

  /*
   *  Scenario where no providers are used
   */
  const basicStrategy = new BasicStrategy(verify);
  const basicAuthStrategy = new StrategyAdapter(
    basicStrategy,
    AUTH_STRATEGY_NAME,
    myUserProfileFactory,
  );

  async function setupBindings1() {
    app
      .bind(BASIC_STRATEGY_BINDING_KEY)
      .to(basicAuthStrategy)
      .tag({
        [CoreTags.EXTENSION_FOR]:
          AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
      });
  }

  async function setupBindings2() {
    addExtension(
      app,
      AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
      PassportBasicAuthProvider,
      {
        namespace:
          AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
      },
    );

    // used by VerifyFunctionProvider
    app.bind(USERS_REPOSITORY_BINDING_KEY).to(users);

    // the verify function for passport-http
    app
      .bind(VERIFY_FUNCTION_BASIC_AUTHENTICATION_BINDING_KEY)
      .toProvider(VerifyFunctionProvider);

    // used by the Strategy Adapter
    app
      .bind(AuthenticationBindings.USER_PROFILE_FACTORY)
      .to(myUserProfileFactory);
  }

  async function remainingSetup(scenario: number) {
    if (scenario === ScenarioEnum.WithoutProviders) {
      await setupBindings1();
    } else if (scenario === ScenarioEnum.WithProviders) await setupBindings2();

    await givenAServer();
  }

  async function givenAServer() {
    server = await app.getServer(RestServer);
    givenAuthenticatedSequence(); //attaches sequence to server
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
      constructor(@inject(SecurityBindings.USER) private user: UserProfile) {}

      @authenticate(AUTH_STRATEGY_NAME)
      async whoAmI(): Promise<string> {
        return this.user[securityId];
      }
    }
    app.controller(MyController);
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

          //call authentication action
          await this.authenticateRequest(request);

          // Authentication successful, proceed to invoke controller
          const args = await this.parseParams(request, route);
          const result = await this.invoke(route, args);
          this.send(response, result);
        } catch (error) {
          // intercept the invalid credentials error issued by
          // verify provider and passed to 'passport-http'
          // add a code to the error object to conform to standard below

          if (error.message.message === INVALID_USER_CREDENTIALS_MESSAGE) {
            Object.assign(error, {code: INVALID_USER_CREDENTIALS_CODE});
            Object.assign(error, {message: INVALID_USER_CREDENTIALS_MESSAGE});
          }

          //
          // The authentication action utilizes a strategy resolver to find
          // an authentication strategy by name, and then it calls
          // strategy.authenticate(request).
          //
          // The strategy resolver throws a non-http error if it cannot
          // resolve the strategy. When the strategy resolver obtains
          // a strategy, it calls strategy.authenticate(request) which
          // is expected to return a user profile. If the user profile
          // is undefined, then it throws a non-http error.
          //
          // It is necessary to catch these errors and add HTTP-specific status
          // code property.
          //
          // Errors thrown by the strategy implementations already come
          // with statusCode set.
          //
          // In the future, we want to improve `@loopback/rest` to provide
          // an extension point allowing `@loopback/authentication` to contribute
          // mappings from error codes to HTTP status codes, so that application
          // doesn't have to map codes themselves.
          if (
            error.code === AUTHENTICATION_STRATEGY_NOT_FOUND ||
            error.code === USER_PROFILE_NOT_FOUND ||
            error.code === INVALID_USER_CREDENTIALS_CODE
          ) {
            Object.assign(error, {statusCode: 401 /* Unauthorized */});
          }

          this.reject(context, error);
          return;
        }
      }
    }
    // bind user defined sequence
    server.sequence(MySequence);
  }

  function whenIMakeRequestTo(restServer: RestServer): Client {
    return createClientForHandler(restServer.requestHandler);
  }
});

//
// A simple User model
//
interface MyUser {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

class UserRepository {
  constructor(
    readonly list: {[key: string]: {profile: MyUser; password: string}},
  ) {}

  /*
   *   Used in 'testing' scenario where authentication strategy does not come from a provider.
   */
  find(username: string, password: string, cb: Function): void {
    const userList = this.list;
    function search(key: string) {
      return userList[key].profile.username === username;
    }
    const found = Object.keys(userList).find(search);
    if (!found) return cb(null, false);
    if (userList[found].password !== password) return cb(null, false);
    cb(null, userList[found].profile);
  }

  /*
   *   Used in 'testing' scenario where authentication strategy comes from a provider.
   *   (Specifically used by verify function provider : VerifyFunctionProvider)
   */
  findWithoutCallBack(username: string, password: string): MyUser | undefined {
    let foundUser;
    const userList = this.list;
    function search(key: string) {
      return userList[key].profile.username === username;
    }

    const found = Object.keys(userList).find(search);
    if (!found) {
      foundUser = undefined;
    } else {
      //found but we need to check the password
      if (userList[found].password !== password) {
        foundUser = undefined;
      } else {
        foundUser = userList[found].profile;
      }
    }

    return foundUser;
  }
}

/*
 *  Scenario where providers ARE used
 */
class PassportBasicAuthProvider implements Provider<AuthenticationStrategy> {
  constructor(
    @inject(VERIFY_FUNCTION_BASIC_AUTHENTICATION_BINDING_KEY)
    private verifyFn: BasicVerifyFunction,
    @inject(AuthenticationBindings.USER_PROFILE_FACTORY)
    private userProfileFactory: UserProfileFactory<MyUser>,
  ) {}
  value(): AuthenticationStrategy {
    const basicStrategy = this.configuredBasicStrategy(this.verifyFn);
    return this.convertToAuthStrategy(basicStrategy);
  }

  // Takes in the verify callback function and returns a configured basic strategy.
  configuredBasicStrategy(verifyFn: BasicVerifyFunction): BasicStrategy {
    return new BasicStrategy(verifyFn);
  }

  // Applies the `StrategyAdapter` to the configured basic strategy instance.
  // You'd better define your strategy name as a constant, like
  // `const AUTH_STRATEGY_NAME = 'basic'`
  // You will need to decorate the APIs later with the same name
  convertToAuthStrategy(basic: BasicStrategy): AuthenticationStrategy {
    return new StrategyAdapter(
      basic,
      AUTH_STRATEGY_NAME,
      this.userProfileFactory,
    );
  }
}

class VerifyFunctionProvider implements Provider<BasicVerifyFunction> {
  constructor(
    @inject(USERS_REPOSITORY_BINDING_KEY) private userRepo: UserRepository,
  ) {}

  value(): BasicVerifyFunction {
    //eslint-disable-next-line
    const myThis = this;
    return async function (username: string, password: string, cb: Function) {
      let user: MyUser | undefined;

      try {
        //find user with specific username
        user = myThis.userRepo.findWithoutCallBack(username, password);

        // if user is undefined, it means user was not found OR password wasn't valid
        if (!user) {
          const error = new Error(INVALID_USER_CREDENTIALS_MESSAGE); //need generic message to look for in sequence. To assign 401.
          throw error;
        }

        // user exists and password matches, so credentials are valid

        //return null for error, and the valid user
        cb(null, user);
      } catch (error) {
        //return the error, and null for the user
        cb(error, null);
      }
    };
  }
}
