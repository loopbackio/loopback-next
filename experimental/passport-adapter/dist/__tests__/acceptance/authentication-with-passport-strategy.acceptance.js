'use strict';
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
var __decorate =
  (this && this.__decorate) ||
  function(decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function(k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function(paramIndex, decorator) {
    return function(target, key) {
      decorator(target, key, paramIndex);
    };
  };
Object.defineProperty(exports, '__esModule', {value: true});
const context_1 = require('@loopback/context');
const core_1 = require('@loopback/core');
const openapi_spec_builder_1 = require('@loopback/openapi-spec-builder');
const openapi_v3_1 = require('@loopback/openapi-v3');
const rest_1 = require('@loopback/rest');
const testlab_1 = require('@loopback/testlab');
const passport_http_1 = require('passport-http');
const authentication_1 = require('@loopback/authentication');
const __1 = require('../../');
const SequenceActions = rest_1.RestBindings.SequenceActions;
const AUTH_STRATEGY_NAME = 'basic';
describe('Basic Authentication', () => {
  let app;
  let server;
  let users;
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
      status() {
        return {running: true};
      }
    }
    __decorate(
      [
        openapi_v3_1.get('/status'),
        __metadata('design:type', Function),
        __metadata('design:paramtypes', []),
        __metadata('design:returntype', void 0),
      ],
      InfoController.prototype,
      'status',
      null,
    );
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
  // class as extension directly, we need to wrap it as a strategy provider,
  // then add the provider class as the extension.
  // See Line 89 in the function `givenAServer`
  class PassportBasicAuthProvider {
    value() {
      const basicStrategy = this.configuredBasicStrategy(verify);
      return this.convertToAuthStrategy(basicStrategy);
    }
    configuredBasicStrategy(verifyFn) {
      return new passport_http_1.BasicStrategy(verifyFn);
    }
    convertToAuthStrategy(basic) {
      return new __1.StrategyAdapter(basic, AUTH_STRATEGY_NAME);
    }
  }
  function verify(username, password, cb) {
    process.nextTick(() => {
      users.find(username, password, cb);
    });
  }
  async function givenAServer() {
    app = new core_1.Application();
    app.component(authentication_1.AuthenticationComponent);
    app.component(rest_1.RestComponent);
    core_1.addExtension(
      app,
      authentication_1.AuthenticationBindings
        .AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
      PassportBasicAuthProvider,
      {
        namespace:
          authentication_1.AuthenticationBindings
            .AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
      },
    );
    server = await app.getServer(rest_1.RestServer);
  }
  function givenControllerInApp() {
    const apispec = openapi_spec_builder_1
      .anOpenApiSpec()
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
    let MyController = class MyController {
      constructor(user) {
        this.user = user;
      }
      async whoAmI() {
        return this.user.id;
      }
    };
    __decorate(
      [
        authentication_1.authenticate(AUTH_STRATEGY_NAME),
        __metadata('design:type', Function),
        __metadata('design:paramtypes', []),
        __metadata('design:returntype', Promise),
      ],
      MyController.prototype,
      'whoAmI',
      null,
    );
    MyController = __decorate(
      [
        openapi_v3_1.api(apispec),
        __param(
          0,
          context_1.inject(
            authentication_1.AuthenticationBindings.CURRENT_USER,
          ),
        ),
        __metadata('design:paramtypes', [Object]),
      ],
      MyController,
    );
    app.controller(MyController);
  }
  function givenAuthenticatedSequence() {
    let MySequence = class MySequence {
      constructor(
        findRoute,
        parseParams,
        invoke,
        send,
        reject,
        authenticateRequest,
      ) {
        this.findRoute = findRoute;
        this.parseParams = parseParams;
        this.invoke = invoke;
        this.send = send;
        this.reject = reject;
        this.authenticateRequest = authenticateRequest;
      }
      async handle(context) {
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
    };
    MySequence = __decorate(
      [
        __param(0, context_1.inject(SequenceActions.FIND_ROUTE)),
        __param(1, context_1.inject(SequenceActions.PARSE_PARAMS)),
        __param(2, context_1.inject(SequenceActions.INVOKE_METHOD)),
        __param(3, context_1.inject(SequenceActions.SEND)),
        __param(4, context_1.inject(SequenceActions.REJECT)),
        __param(
          5,
          context_1.inject(authentication_1.AuthenticationBindings.AUTH_ACTION),
        ),
        __metadata('design:paramtypes', [
          Function,
          Function,
          Function,
          Function,
          Function,
          Function,
        ]),
      ],
      MySequence,
    );
    // bind user defined sequence
    server.sequence(MySequence);
  }
  function whenIMakeRequestTo(restServer) {
    return testlab_1.createClientForHandler(restServer.requestHandler);
  }
});
class UserRepository {
  constructor(list) {
    this.list = list;
  }
  find(username, password, cb) {
    const userList = this.list;
    function search(key) {
      return userList[key].profile.id === username;
    }
    const found = Object.keys(userList).find(search);
    if (!found) return cb(null, false);
    if (userList[found].password !== password) return cb(null, false);
    cb(null, userList[found].profile);
  }
}
//# sourceMappingURL=authentication-with-passport-strategy.acceptance.js.map
