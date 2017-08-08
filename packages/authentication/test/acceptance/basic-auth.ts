// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  api,
  ServerResponse,
  ParsedRequest,
  ParseParams,
  FindRoute,
  InvokeMethod,
  GetFromContext,
  BindElement,
  HttpErrors,
  Send,
  Reject,
  SequenceHandler,
} from '@loopback/core';
import {expect, Client, createClientForApp} from '@loopback/testlab';
import {anOpenApiSpec} from '@loopback/openapi-spec-builder';
import {
  inject,
  Provider,
  ValueOrPromise,
} from '@loopback/context';
import {
  authenticate,
  UserProfile,
  BindingKeys,
  AuthenticateFn,
  AuthMetadataProvider,
  AuthenticationMetadata,
  AuthenticationComponent,
} from '../..';
import {Strategy} from 'passport';
import {HttpError} from 'http-errors';
import {BasicStrategy} from 'passport-http';

describe('Basic Authentication', () => {
  let app: Application;
  let users: UserRepository;

  beforeEach(givenUserRepository);
  beforeEach(givenAnApplication);
  beforeEach(givenControllerInApp);
  beforeEach(givenAuthenticatedSequence);
  beforeEach(givenProviders);

  it ('authenticates successfully for correct credentials', async () => {
    const client = whenIMakeRequestTo(app);
    const credential =
      users.list.joe.profile.id + ':' + users.list.joe.password;
    const hash = new Buffer(credential).toString('base64');
    await client.get('/whoAmI')
      .set('Authorization', 'Basic ' + hash)
      .expect(users.list.joe.profile.id);
  });

  it('returns error for invalid credentials', async () => {
    const client = whenIMakeRequestTo(app);
    const credential = users.list.Simpson.profile.id + ':' + 'invalid';
    const hash = new Buffer(credential).toString('base64');
    await client.get('/whoAmI')
      .set('Authorization', 'Basic ' + hash)
      .expect(401);
  });

  function givenUserRepository() {
    users = new UserRepository({
      joe : {profile: {id: 'joe'}, password: '12345'},
      Simpson: {profile: {id: 'sim123'}, password: 'alpha'},
      Flinstone: {profile: {id: 'Flint'}, password: 'beta'},
      George: {profile: {id: 'Curious'}, password: 'gamma'},
    });
  }

  function givenAnApplication() {
    app = new Application({
      components: [AuthenticationComponent],
    });
  }

  function givenControllerInApp() {
    const apispec = anOpenApiSpec()
      .withOperation('get', '/whoAmI', {
        'x-operation-name': 'whoAmI',
        responses: {
          '200': {
            type: 'string',
          },
        },
      })
      .build();

    @api(apispec)
    class MyController {
      constructor(
        @inject(BindingKeys.Authentication.CURRENT_USER)
        private user: UserProfile,
      ) {}

      @authenticate('BasicStrategy')
      async whoAmI() : Promise<string> {
        return this.user.id;
      }
    }
    app.controller(MyController);
  }

  function givenAuthenticatedSequence() {
    class MySequence implements SequenceHandler {
      constructor(
        @inject('sequence.actions.findRoute') protected findRoute: FindRoute,
        @inject('sequence.actions.parseParams')
        protected parseParams: ParseParams,
        @inject('sequence.actions.invokeMethod') protected invoke: InvokeMethod,
        @inject('sequence.actions.send') protected send: Send,
        @inject('sequence.actions.reject') protected reject: Reject,
        @inject('bindElement') protected bindElement: BindElement,
        @inject('authentication.actions.authenticate')
        protected authenticateRequest: AuthenticateFn,
      ) {}

      async handle(req: ParsedRequest, res: ServerResponse) {
        try {
          const route = this.findRoute(req);

          // Authenticate
          const user: UserProfile = await this.authenticateRequest(req);

          // Authentication successful, proceed to invoke controller
          const args = await this.parseParams(req, route);
          const result = await this.invoke(route, args);
          this.send(res, result);
        } catch (err) {
          this.reject(res, req, err);
          return;
        }
      }
    }
    // bind user defined sequence
    app.sequence(MySequence);
  }

  function givenProviders() {
    class MyPassportStrategyProvider implements Provider<Strategy> {
      constructor(
        @inject(BindingKeys.Authentication.METADATA)
        private metadata: AuthenticationMetadata,
      ) {}
      value() : ValueOrPromise<Strategy> {
        const name = this.metadata.strategy;
        if (name === 'BasicStrategy') {
          return new BasicStrategy(this.verify);
        } else {
          return Promise.reject(`The strategy ${name} is not available.`);
        }
      }
      // callback method for BasicStrategy
      verify(username: string, password: string, cb: Function) {
        process.nextTick(() => {
          users.find(username, password, cb);
        });
      }
    }
    app.bind(BindingKeys.Authentication.STRATEGY)
      .toProvider(MyPassportStrategyProvider);
  }

  function whenIMakeRequestTo(application: Application): Client {
    return createClientForApp(app);
  }
});

class UserRepository {
  constructor(
    readonly list: {[key: string] : {profile: UserProfile, password: string}},
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
