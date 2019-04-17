// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {addExtension, Application} from '@loopback/core';
import {anOpenApiSpec} from '@loopback/openapi-spec-builder';
import {api, get} from '@loopback/openapi-v3';
import {
  FindRoute,
  HttpErrors,
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
import {
  authenticate,
  AuthenticateFn,
  AuthenticationBindings,
  AuthenticationComponent,
  UserProfile,
} from '../..';
import {AUTHENTICATION_STRATEGY_NOT_FOUND} from '../../types';
import {BasicAuthenticationStrategyBindings, USER_REPO} from '../fixtures/keys';
import {BasicAuthenticationUserService} from '../fixtures/services/basic-auth-user-service';
import {BasicAuthenticationStrategy} from '../fixtures/strategies/basic-strategy';
import {UserRepository} from '../fixtures/users/user.repository';

const SequenceActions = RestBindings.SequenceActions;

describe('Basic Authentication', () => {
  let app: Application;
  let server: RestServer;
  let users: UserRepository;
  beforeEach(givenAServer);
  beforeEach(givenControllerInApp);
  beforeEach(givenAuthenticatedSequence);
  beforeEach(givenProviders);

  it(`authenticates successfully for correct credentials for user 'jack'`, async () => {
    const client = whenIMakeRequestTo(server);
    const credential =
      users.list['joe@example.com'].user.email +
      ':' +
      users.list['joe@example.com'].user.password;
    const hash = Buffer.from(credential).toString('base64');
    await client
      .get('/whoAmI')
      .set('Authorization', 'Basic ' + hash)
      .expect(users.list['joe@example.com'].user.email);
  });

  it(`authenticates successfully for correct credentials for user 'jill'`, async () => {
    const client = whenIMakeRequestTo(server);
    const credential =
      users.list['jill@example.com'].user.email +
      ':' +
      users.list['jill@example.com'].user.password;
    const hash = Buffer.from(credential).toString('base64');
    await client
      .get('/whoAmI')
      .set('Authorization', 'Basic ' + hash)
      .expect(users.list['jill@example.com'].user.email);
  });

  it('returns error for missing Authorization header', async () => {
    const client = whenIMakeRequestTo(server);

    //not passing in 'Authorization' header
    await client.get('/whoAmI').expect(401);
  });

  it(`returns error for missing 'Basic ' portion of Authorization header value`, async () => {
    const client = whenIMakeRequestTo(server);
    const credential =
      users.list['joe@example.com'].user.email +
      ':' +
      users.list['joe@example.com'].user.password;
    const hash = Buffer.from(credential).toString('base64');
    await client
      .get('/whoAmI')
      .set('Authorization', 'NotB@s1c ' + hash)
      .expect(401);
  });

  it(`returns error for missing ':' in decrypted Authorization header credentials value`, async () => {
    const client = whenIMakeRequestTo(server);
    const credential =
      users.list['joe@example.com'].user.email +
      '|' +
      users.list['joe@example.com'].user.password; // substituting ':' with '|'
    const hash = Buffer.from(credential).toString('base64');
    await client
      .get('/whoAmI')
      .set('Authorization', 'Basic ' + hash)
      .expect(401);
  });

  it(`returns error for too many parts in decrypted Authorization header credentials value`, async () => {
    const client = whenIMakeRequestTo(server);
    const credential =
      users.list['joe@example.com'].user.email +
      ':' +
      users.list['joe@example.com'].user.password +
      ':' +
      'extraPart'; // three parts instead of two
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

  async function givenAServer() {
    app = new Application();
    app.component(AuthenticationComponent);
    app.component(RestComponent);
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

      @authenticate('basic')
      async whoAmI(): Promise<string> {
        if (this.user) {
          if (this.user.email) return this.user.email;
          else return 'user email is undefined';
        } //if
        else return 'user is undefined';
      }
    }

    app.controller(MyController);
  }

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
      .expect(401);
  });

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

          //
          // The authentication action utilizes a strategy resolver to find
          // an authentication strategy by name, and then it calls
          // strategy.authenticate(request).
          //
          // The strategy resolver throws a non-http error if it cannot
          // resolve the strategy. It is necessary to catch this error
          // and rethrow it as in http error (in our REST application example)
          //
          // Errors thrown by the strategy implementations are http errors
          // (in our REST application example). We simply rethrow them.
          //
          try {
            //call authentication action
            await this.authenticateRequest(request);
          } catch (e) {
            // strategy not found error
            if (e.code === AUTHENTICATION_STRATEGY_NOT_FOUND) {
              throw new HttpErrors.Unauthorized(e.message);
            } //if
            else {
              // strategy error
              throw e;
            } //endif
          } //catch

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
    addExtension(
      server,
      AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
      BasicAuthenticationStrategy,
      {
        namespace:
          AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
      },
    );

    server
      .bind(BasicAuthenticationStrategyBindings.USER_SERVICE)
      .toClass(BasicAuthenticationUserService);

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
