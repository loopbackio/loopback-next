// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication-passport
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  authenticate,
  AuthenticateFn,
  AuthenticationBindings,
  AuthenticationComponent,
  UserProfile,
} from '@loopback/authentication';
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
      users.list.joe.profile.id + ':' + users.list.joe.password;
    const hash = Buffer.from(credential).toString('base64');
    await client
      .get('/whoAmI')
      .set('Authorization', 'Basic ' + hash)
      .expect(users.list.joe.profile.id);
  });

  it('returns error for invalid credentials', async () => {
    const client = whenIMakeRequestTo(server);
    const credential = users.list.Simpson.profile.id + ':' + 'invalid';
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

  function givenUserRepository() {
    users = new UserRepository({
      joe: {profile: {id: 'joe'}, password: '12345'},
      Simpson: {profile: {id: 'sim123'}, password: 'alpha'},
      Flinstone: {profile: {id: 'Flint'}, password: 'beta'},
      George: {profile: {id: 'Curious'}, password: 'gamma'},
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
        return this.user.id;
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
      return userList[key].profile.id === username;
    }
    const found = Object.keys(userList).find(search);
    if (!found) return cb(null, false);
    if (userList[found].password !== password) return cb(null, false);
    cb(null, userList[found].profile);
  }
}
