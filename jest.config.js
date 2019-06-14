module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: [
    // Ignore compiled output, we want to run original TypeScript files
    'dist',
  ],
  roots: [
    // Skip benchmark tests for now, they are too slow on CI
    // '<rootDir>/benchmark',
    '<rootDir>/examples',
    '<rootDir>/packages',
  ],
  setupFiles: ['<rootDir>/jest-bdd-setup.js'],
  testPathIgnorePatterns: [
    'fixtures',

    // TODO(bajtos) define a convention on where test-helpers should be placed,
    // e.g. `src/__tests__/helpers`, so that we can ignore all helpers
    // in all packages by a single pattern.
    '<rootDir>/examples/log-extension/src/__tests__/log-spy.ts',
    '<rootDir>/examples/log-extension/src/__tests__/in-memory-logger.ts',
    'test-helper.ts',
    '__tests__/helpers.ts',
    '<rootDir>/packages/rest/src/__tests__/acceptance/caching-interceptor/caching-interceptor.ts',
    '<rootDir>/packages/repository-json-schema/src/__tests__/helpers/',
    '<rootDir>/packages/service-proxy/src/__tests__/mock-service.connector.ts',
    '<rootDir>/packages/rest/src/__tests__/unit/coercion/utils.ts',

    // This is a test file that we need to compile only
    '<rootDir>/packages/repository-json-schema/src/__tests__/unit/json-schema.unit.ts',

    // These files are setting custom timeout set via `this.timeout()`
    // Jest requires the timeout to be provided as the 3rd argument of it/describe
    '<rootDir>/examples/context/src/__tests__/acceptance/examples.acceptance.ts',
    '<rootDir>/packages/booter-lb3app/src/__tests__/acceptance/booter-lb3app.acceptance.ts',
    '<rootDir>/examples/soap-calculator/src/__tests__/acceptance/application.acceptance.ts',
    '<rootDir>/examples/soap-calculator/src/__tests__/integration/services/calculator.service.integration.ts',
    '<rootDir>/examples/todo/src/__tests__/acceptance/todo.acceptance.ts',
    '<rootDir>/examples/todo/src/__tests__/integration/services/geocoder.service.integration.ts',
    '<rootDir>/packages/http-caching-proxy/src/__tests__/integration/http-caching-proxy.integration.ts',
    '<rootDir>/packages/tsdocs/src/__tests__/acceptance/tsdocs.acceptance.ts',

    // tests that don't pass yet

    // Booter-related problems (booter looks for transpiled .js files that are not available)
    '<rootDir>/examples/greeting-app/src/__tests__/integration/greeting-service.integration.ts',
    '<rootDir>/packages/boot/src/__tests__/integration',
    '<rootDir>/packages/boot/src/__tests__/acceptance',
    '<rootDir>/packages/boot/src/__tests__/unit/booters/controller.booter.unit.ts',
    '<rootDir>/packages/boot/src/__tests__/unit/booters/booter-utils.unit.ts',
    '<rootDir>/packages/boot/src/__tests__/unit/booters/base-artifact.booter.unit.ts',
    '<rootDir>/packages/boot/src/__tests__/unit/booters/service.booter.unit.ts',
    '<rootDir>/packages/boot/src/__tests__/unit/booters/repository.booter.unit.ts',
    '<rootDir>/packages/boot/src/__tests__/unit/booters/datasource.booter.unit.ts',

    /*
    ● Context › event notification › does not trigger observers registered after an event

    Error [ERR_UNHANDLED_ERROR]: Unhandled error. (Error: something wrong

      244 |         observe: async () => {
      245 |           await setImmediateAsync();
    > 246 |           throw new Error('something wrong');
          |                 ^
      247 |         },
      248 |       };
      249 |       ctx.subscribe(nonMatchingObserver);

      at Object.observe (packages/context/src/__tests__/unit/context-observer.unit.ts:246:17)
      at TestContext.notifyObservers (packages/context/src/context.ts:604:9)
      at TestContext.processNotifications (packages/context/src/context.ts:270:9))
      at TestContext.handleNotificationError (packages/context/src/context.ts:244:10)
      at packages/context/src/context.ts:170:12

    ● Context › event notification for context chain › receives notifications of matching binding events

    AssertionError: expected Array [ 'SYNC:foo:foo-value:bind', 'ASYNC:foo:foo-value:bind' ] to equal Array [
      'SYNC:foo:foo-value:bind',
      'ASYNC:foo:foo-value:bind',
      'SYNC:xyz:xyz-value:bind',
      'ASYNC:xyz:xyz-value:bind',
      'LATE:xyz:xyz-value:bind'
    ] (at length, A has 2 and B has 5)
    */
    '<rootDir>/packages/context/src/__tests__/unit/context-observer.unit.ts',

    /*
      ● HasMany relation › can create an instance of the related model

    ReferenceError: Cannot access 'CustomerController' before initialization

      243 |
      244 |   async function givenCustomerController() {
    > 245 |     app.controller(CustomerController);
          |                    ^
      246 |     controller = await app.get<CustomerController>(
      247 |       'controllers.CustomerController',
      248 |     );

      at Object.givenCustomerController (packages/repository/src/__tests__/acceptance/has-many.relation.acceptance.ts:245:20)
    */
    '<rootDir>/packages/repository/src/__tests__/acceptance/.*.relation.acceptance.ts',

    /*
    ● TestSandbox integration tests › updates source map path for a copied file

    ENOENT: no such file or directory, stat '/Users/bajtos/src/loopback/next/packages/testlab/src/__tests__/fixtures/test.js'

    ● TestSandbox integration tests › decaches files from npm require when sandbox is reset

    AssertionError: expected Object { x: 1 } to equal Object { x: 2 } (at x, A has 1 and B has 2)

      82 |     await writeJSON(resolve(path, file), {x: 2});
      83 |     const data2 = require(resolve(path, file));
    > 84 |     expect(data2).to.be.eql({x: 2});
         |                         ^
      85 |   });
      86 |
      87 |   it('deletes the test sandbox', async () => {

      at Assertion.fail (packages/testlab/node_modules/should/as-function.js:275:17)
      at Assertion.value (packages/testlab/node_modules/should/as-function.js:356:19)
      at Object.<anonymous> (packages/testlab/src/__tests__/integration/test-sandbox.integration.ts:84:25)
    */
    '<rootDir>/packages/testlab/src/__tests__/integration/test-sandbox.integration.ts',

    /*
     ● PingController › invokes GET /ping

    expected 200 "OK", got 404 "Not Found"

      at Test.Object.<anonymous>.Test._assertStatus (packages/testlab/node_modules/supertest/lib/test.js:268:12)
      at Test.Object.<anonymous>.Test._assertFunction (packages/testlab/node_modules/supertest/lib/test.js:283:11)
      at Test.Object.<anonymous>.Test.assert (packages/testlab/node_modules/supertest/lib/test.js:173:18)
      at localAssert (packages/testlab/node_modules/supertest/lib/test.js:131:12)
      at packages/testlab/node_modules/supertest/lib/test.js:128:5
      at Test.Object.<anonymous>.Request.callback (packages/testlab/node_modules/superagent/lib/node/index.js:728:3)
      at packages/testlab/node_modules/superagent/lib/node/index.js:916:18
      at IncomingMessage.<anonymous> (packages/testlab/node_modules/superagent/lib/node/parsers/json.js:19:7)
    */
    '<rootDir>/examples/express-composition/src/__tests__/acceptance/ping.controller.acceptance.ts',

    /*
    NoteApplication › creates a note

    The key 'repositories.NoteRepository' is not bound to any value in context application

      886 |
      887 |     if (options && options.optional) return undefined;
    > 888 |     throw new Error(
          |           ^
      889 |       `The key '${key}' is not bound to any value in context ${this.name}`,
      890 |     );
      891 |   }

      at NoteApplication.getBinding (packages/context/src/context.ts:888:11)
      at NoteApplication.getValueOrPromise (packages/context/src/context.ts:952:26)
      at NoteApplication.get (packages/context/src/context.ts:765:23)
      at NoteApplication.getRepository (packages/repository/src/mixins/repository.mixin.ts:88:25)
      at givenNoteRepository (examples/express-composition/src/__tests__/acceptance/note.acceptance.ts:64:28)
      at Object.givenApplication (examples/express-composition/src/__tests__/acceptance/note.acceptance.ts:21:11)
     */
    '<rootDir>/examples/express-composition/src/__tests__/acceptance/note.acceptance.ts',
    '<rootDir>/examples/todo-list/src/__tests__/acceptance/',

    /*
    CoffeeShopApplication › LoopBack 3 authentication › denies request made by another user's access token
       TypeError: User.login is not a function

      110 |       ]);
      111 |
    > 112 |       const token = await User.login({
          |                                ^
      113 |         email: users[0].email,
      114 |         password: 'L00pBack!',
      115 |       });

      at Object.<anonymous> (examples/lb3-application/src/__tests__/acceptance/lb3app.acceptance.ts:112:32)

      CoffeeShopApplication › OpenAPI spec › appends the basePath and transfers the paths from the LB3 spec to the LB4 spec

    AssertionError: expected Array [
      '/api/Users/{id}/accessTokens/{fk}',
      '/api/Users/{id}/accessTokens',
      '/api/Users/{id}/accessTokens/count',
      '/api/Users',
      '/api/Users/replaceOrCreate',
      '/api/Users/upsertWithWhere',
      '/api/Users/{id}/exists',
      '/api/Users/{id}',
      '/api/Users/{id}/replace',
      '/api/Users/findOne',
      '/api/Users/update',
      '/api/Users/count',
      '/api/Users/change-stream',
      '/api/CoffeeShops',
      '/api/CoffeeShops/replaceOrCreate',
      '/api/CoffeeShops/upsertWithWhere',
      '/api/CoffeeShops/{id}/exists',
      '/api/CoffeeShops/{id}',
      '/api/CoffeeShops/{id}/replace',
      '/api/CoffeeShops/findOne',
      '/api/CoffeeShops/update',
      '/api/CoffeeShops/count',
      '/api/CoffeeShops/change-stream'
    ] to have property length of 32 (got 23)
    */
    '<rootDir>/examples/lb3-application/src/__tests__/acceptance/lb3app.acceptance.ts',
  ],
};
