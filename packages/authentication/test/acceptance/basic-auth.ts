// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  api,
  OpenApiSpec,
  ParameterObject,
  ServerRequest,
  ServerResponse,
  parseOperationArgs,
  writeResultToResponse,
  ParsedRequest,
  OperationArgs,
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
import {inject,
  Provider,
  ValueOrPromise,
  Context,
  Injection,
  BoundValue,
} from '@loopback/context';
import {authenticate,
  UserProfile,
  BindingKeys,
  AuthenticateFn,
  AuthenticationProvider,
  AuthenticationMetadata,
  AuthMetadataProvider,
} from '../..';
import {Strategy} from 'passport';
import {HttpError} from 'http-errors';

const BasicStrategy = require('passport-http').BasicStrategy;

describe('Basic Authentication', () => {
  let app: Application;
  let users: UserRepository;

  beforeEach(givenUserRespository);
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

  function givenUserRespository() {
    users = new UserRepository({
      joe : {profile: {id: 'joe'}, password: '12345'},
      Simpson: {profile: {id: 'sim123'}, password: 'alpha'},
      Flintstone: {profile: {id: 'Flint'}, password: 'beta'},
      George: {profile: {id: 'Curious'}, password: 'gamma'},
    });
  }

  function givenAnApplication() {
    app = new Application();
    app.bind('application.name').to('SequenceApp');
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
      constructor(@inject('authentication.user') private user: UserProfile) {}

      @authenticate('BasicStrategy')
      async whoAmI() : Promise<string> {
        return this.user.id;
      }
    }
    app.controller(MyController);
  }

  function deferredResolver(
    ctx: Context,
    injection: Injection,
  ):  BoundValue {
    return async (...args: BoundValue[]) => {
      const fn = await ctx.get(injection.bindingKey);
      return await fn(...args);
    };
  }

  function givenAuthenticatedSequence() {
    class MySequence implements SequenceHandler {
      constructor(
        @inject('findRoute') protected findRoute: FindRoute,
        @inject('getFromContext') protected getFromContext: GetFromContext,
        @inject('invokeMethod') protected invoke: InvokeMethod,
        @inject('sequence.actions.send') protected send: Send,
        @inject('sequence.actions.reject') protected reject: Reject,
        @inject('bindElement') protected bindElement: BindElement,
        @inject('authentication.provider', {}, deferredResolver)
        protected authenticateRequest: AuthenticateFn,
      ) {}

      async handle(req: ParsedRequest, res: ServerResponse) {
        try {
          const {route, pathParams} = this.findRoute(req);

          // Authenticate
          const user: UserProfile = await this.authenticateRequest(req);

          // User is expected to be returned or an exception should be thrown
          if (user) this.bindElement('authentication.user').to(user);
          else throw new HttpErrors.InternalServerError('auth error');

          // Authentication successful, proceed to invoke controller
          const args = await parseOperationArgs(req, route, pathParams);
          const result = await this.invoke(route, args);
          this.send(res, result);
        } catch (err) {
          this.reject(res, req, err);
          return;
        }
      }
    }
    // bind user defined sequence
    app.bind('sequence').toClass(MySequence);
  }

  function givenProviders() {
    class MyPassportStrategyProvider implements Provider<Strategy> {
      constructor(
        @inject(BindingKeys.Authentication.METADATA)
        private metadata: AuthenticationMetadata,
      ) {}
      value() : Promise<Strategy> {
        if (this.metadata.strategy === 'BasicStrategy') {
          return new BasicStrategy(this.verify);
        } else {
          return Promise.reject('configured strategy is not available');
        }
      }
      // callback method for BasicStrategy
      verify(username: string, password: string, cb: Function) {
        process.nextTick(() => {
          users.find(username, password, cb);
        });
      }
    }
    app.bind(BindingKeys.Authentication.METADATA)
      .toProvider(AuthMetadataProvider);
    app.bind(BindingKeys.Authentication.STRATEGY)
      .toProvider(MyPassportStrategyProvider);
    app.bind(BindingKeys.Authentication.PROVIDER)
      .toProvider(AuthenticationProvider);
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
