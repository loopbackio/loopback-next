// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication-passport
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  authenticate,
  AuthenticateFn,
  AuthenticationBindings,
  AuthenticationComponent,
  AUTHENTICATION_STRATEGY_NOT_FOUND,
  USER_PROFILE_NOT_FOUND,
} from '@loopback/authentication';
import {UserProfile, securityId} from '@loopback/security';
import {inject} from '@loopback/context';
import {Application, CoreTags} from '@loopback/core';
import {anOpenApiSpec} from '@loopback/openapi-spec-builder';
import {api, get} from '@loopback/openapi-v3';
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
import {Client, createClientForHandler} from '@loopback/testlab';
import {BasicStrategy} from 'passport-http';
import {StrategyAdapter} from '../../strategy-adapter';
const SequenceActions = RestBindings.SequenceActions;
const AUTH_STRATEGY_NAME = 'basic';

describe('Basic Authentication', () => {
  let app: Application;
  let server: RestServer;
  let users: UserRepository;
  beforeEach(givenAServer);
  beforeEach(givenUserRepository);
  beforeEach(givenControllerInApp);
  beforeEach(givenAuthenticatedSequence);

  it('authenticates successfully for correct credentials', async () => {
    const client = whenIMakeRequestTo(server);
    const credential =
      users.list.joe.profile[securityId] + ':' + users.list.joe.password;
    const hash = Buffer.from(credential).toString('base64');
    await client
      .get('/whoAmI')
      .set('Authorization', 'Basic ' + hash)
      .expect(users.list.joe.profile[securityId]);
  });

  it('returns error for invalid credentials', async () => {
    const client = whenIMakeRequestTo(server);
    const credential = users.list.Simpson.profile[securityId] + ':' + 'invalid';
    const hash = Buffer.from(credential).toString('base64');
    await client
      .get('/whoAmI')
      .set('Authorization', 'Basic ' + hash)
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

  // FIXME: In a real database the column/field won't be a symbol
  function givenUserRepository() {
    users = new UserRepository({
      joe: {profile: {[securityId]: 'joe'}, password: '12345'},
      Simpson: {profile: {[securityId]: 'sim123'}, password: 'alpha'},
      Flinstone: {profile: {[securityId]: 'Flint'}, password: 'beta'},
      George: {profile: {[securityId]: 'Curious'}, password: 'gamma'},
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
  const basicStrategy = new BasicStrategy(verify);
  const basicAuthStrategy = new StrategyAdapter(
    basicStrategy,
    AUTH_STRATEGY_NAME,
  );

  async function givenAServer() {
    app = new Application();
    app.component(AuthenticationComponent);
    app.component(RestComponent);
    app
      .bind('authentication.strategies.basicAuthStrategy')
      .to(basicAuthStrategy)
      .tag({
        [CoreTags.EXTENSION_FOR]:
          AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
      });

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
      constructor(
        @inject(AuthenticationBindings.CURRENT_USER) private user: UserProfile,
      ) {}

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
            error.code === USER_PROFILE_NOT_FOUND
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

class UserRepository {
  constructor(
    readonly list: {[key: string]: {profile: UserProfile; password: string}},
  ) {}
  find(username: string, password: string, cb: Function): void {
    const userList = this.list;
    function search(key: string) {
      return userList[key].profile[securityId] === username;
    }
    const found = Object.keys(userList).find(search);
    if (!found) return cb(null, false);
    if (userList[found].password !== password) return cb(null, false);
    cb(null, userList[found].profile);
  }
}
