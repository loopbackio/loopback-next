# LoopBack Test Lab

A collection of test utilities we use to write LoopBack tests.

## Overview

Test utilities to help writing LoopBack 4 tests:

- `expect` - behavior-driven development (BDD) style assertions
- `sinon`
  - test spies: functions recording arguments and other information for all of
    their calls
  - stubs: functions (spies) with pre-programmed behavior
  - mocks: fake methods (like spies) with pre-programmed behavior (like stubs)
    as well as pre-programmed expectations
- Helpers for creating `supertest` clients for LoopBack applications
- HTTP request/response stubs for writing tests without a listening HTTP server
- Swagger/OpenAPI spec validation
- Test sandbox

## Installation

```sh
npm install --save-dev @loopback/testlab
```

_This package is typically used in tests, save it to `devDependencies` via
`--save-dev`._

## Basic use

```ts
import {expect} from '@loopback/testlab';

describe('Basic assertions', => {
  it('asserts equal values', => {
    expect({key: 'value'}).to.deepEqual({key: 'value'});
    expect.exists(1);
  });
});
```

## API documentation

Table of contents:

- [expect](#expect) - Better assertions.
- [sinon](#sinon) - Mocks, stubs and more.
- [shot](#shot) - HTTP Request/Response stubs.
- [validateApiSpec](#validateapispec) - Open API Spec validator.
- [skipIf](#skipif) - Skip tests when a condition is met.
- [skipOnTravis](#skipontravis) - Skip tests on Travis env.
- [createRestAppClient](#createrestappclient) - Create a supertest client
  connected to a running RestApplication.
- [givenHttpServerConfig](#givenhttpserverconfig) - Generate HTTP server config.
- [httpGetAsync](#httpgetasync) - Async wrapper for HTTP GET requests.
- [httpsGetAsync](#httpsgetasync) - Async wrapper for HTTPS GET requests.
- [toJSON](#toJSON) - A helper to obtain JSON data representing a given object.
- [createUnexpectedHttpErrorLogger](#createunexpectedhttprrrorlogger) - An error
  logger that only logs errors for unexpected HTTP statuses.
- [TestSandbox](#testsandbox) - A sandbox directory for tests

### `expect`

[Should.js](https://shouldjs.github.io/) configured in "as-function" mode
(global `Object.prototype` is left intact) with an extra chaining word `to`.

### `sinon`

Spies, mocks and stubs. Learn more at <http://sinonjs.org/>.

### `shot`

Stub implementation of HTTP Request and Response objects, useful for unit tests.

Besides the API provided by `shot` module (see
[API Reference](https://github.com/hapijs/shot/blob/master/API.md)), we provide
additional APIs to better support async/await flow control and usage in
Express-based code.

There are three primary situations where you can leverage stub objects provided
by Shot in your unit tests:

- Code parsing core HTTP Request
- Code modifying core HTTP Response, including full request/response handlers
- Code parsing Express HTTP Request or modifying Express HTTP Response

#### Test request parsing

Use the factory function `stubServerRequest` to create a stub request that can
be passed to methods expecting core HTTP Request on input.

```ts
import {stubServerRequest, expect} from '@loopback/testlab';

describe('parseParams', () => {
  it('parses query string arguments', () => {
    const request = stubServerRequest({
      method: 'GET',
      url: '/api/products?count=10',
    });

    const args = parseParams(request, [
      {name: 'count', in: 'query', type: 'number'},
    ]);

    expect(args).to.eql([10]);
  });
});
```

#### Test response producers

Use the factory function `stubHandlerContext` to create request & response stubs
and a promise to observe the actual response as received by clients.

```ts
import {stubHandlerContext, expect} from '@loopback/testlab';

describe('app REST handler', () => {
  it('returns 404 with JSON body when URL not found', async () => {
    const app = express();
    const context = stubHandlerContext({
      method: 'GET',
      url: '/path-does-not-exist',
    });

    // Invoke Express' request handler with stubbed request/response objects
    app(context.request, context.response);

    // Wait until Express finishes writing the response
    const actualResponse = await context.result;

    // Verify the response seen by clients
    expect(actualResponse.statusCode).to.equal(404);
    expect(JSON.parse(actualResponse.payload)).to.containEql({
      error: {
        statusCode: 404,
        message: 'Not Found',
      },
    });
  });
});
```

#### Test code expecting Express Request or Response

Express modifies core HTTP request and response objects with additional
properties and methods, it also cross-links request with response and vice
versa. As a result, it's not possible to create Express Request object without
the accompanying Response object.

Use the factory function `stubExpressContext` to create Express-flavored request
& response stubs and a promise to observe the actual response as received by
clients.

If your tested function is expecting a request object only:

```ts
import {stubExpressContext, expect} from '@loopback/testlab';

describe('operationArgsParser', () => {
  it('parses body parameter', async () => {
    const req = givenRequest({
      url: '/',
      payload: {key: 'value'},
    });

    const spec = givenOperationWithRequestBody({
      description: 'data',
      content: {'application/json': {schema: {type: 'object'}}},
    });
    const route = givenResolvedRoute(spec);

    const args = await parseOperationArgs(req, route);

    expect(args).to.eql([{key: 'value'}]);
  });

  function givenRequest(options?: ShotRequestOptions): Request {
    return stubExpressContext(options).request;
  }
});
```

Tests verifying code producing HTTP response can await `context.result` to
receive the response as returned to clients.

```ts
import {stubExpressContext, expect} from '@loopback/testlab';

describe('response writer', () => {
  it('writes object result to response as JSON', async () => {
    const context = stubExpressContext();

    writeResultToResponse(context.response, {name: 'Joe'});
    const result = await context.result;

    expect(result.headers['content-type']).to.eql('application/json');
    expect(result.payload).to.equal('{"name":"Joe"}');
  });
});
```

### `skipIf`

Helper function for skipping tests when a certain condition is met. Use this
helper together with `it` or `describe`.

```ts
skipIf(someCondition, it, 'does something', async () => {
  // the test code
});
```

Unfortunately, type inference does not work well for `describe`, you have to
help the compiler to figure out the correct types.

```ts
skipIf<[(this: Suite) => void], void>(
  someCondition,
  describe,
  'some suite name',
  () => {
    // define the test cases
  },
);
```

Under the hood, `skipIf` invokes the provided test verb by default (e.g. `it`).
When the provided condition was true, then it calls `.skip` instead (e.g.
`it.skip`).

### `skipOnTravis`

Helper function for skipping tests on Travis environment. If you need to skip
testing on Travis for any reason, use this helper together with `it` or
`describe`.

```ts
skipOnTravis(it, 'does something when some condition', async () => {
  // the test code
});
```

Under the hood, `skipOnTravis` invokes the provided test verb by default (e.g.
`it`). When the helper detects Travis CI environment variables, then it calls
`.skip` instead (e.g. `it.skip`).

### `createRestAppClient`

Helper function to create a `supertest` client connected to a running
RestApplication. It is the responsibility of the caller to ensure that the app
is running and to stop the application after all tests are done.

Example use:

```ts
import {Client, createRestAppClient} from '@loopback/testlab';

describe('My application', () => {
  app: MyApplication; // extends RestApplication
  client: Client;

  before(givenRunningApplication);
  before(() => {
    client = createRestAppClient(app);
  });
  after(() => app.stop());

  it('invokes GET /ping', async () => {
    await client.get('/ping?msg=world').expect(200);
  });
});
```

### `givenHttpServerConfig`

Helper function for generating Travis-friendly host (127.0.0.1). This is
required because Travis is not able to handle IPv6 addresses.

### `httpGetAsync`

Async wrapper for making HTTP GET requests.

```ts
import {httpGetAsync} from '@loopback/testlab';
const response = await httpGetAsync('http://example.com');
```

### `httpsGetAsync`

Async wrapper for making HTTPS GET requests.

```ts
import {httpsGetAsync} from '@loopback/testlab';
const response = await httpsGetAsync('https://example.com');
```

### `toJSON`

JSON encoding does not preserve properties that are undefined. As a result,
`deepEqual` checks fail because the expected model value contains these
undefined property values, while the actual result returned by REST API does
not. Use this function to convert a model instance into a data object as
returned by REST API.

```ts
import {createClientForHandler, toJSON} from '@loopback/testlab';

it('gets a todo by ID', () => {
  return client
    .get(`/todos/${persistedTodo.id}`)
    .expect(200, toJSON(persistedTodo));
});
```

### `validateApiSpec`

Verify that your application API specification is a valid OpenAPI spec document.

```js
import {validateApiSpec} from '@loopback/testlab';
import {RestServer} from '@loopback/rest';

describe('MyApp', () => {
  it('has valid spec', async () => {
    const app = new MyApp();
    const server = await app.getServer(RestServer);
    await validateApiSpec(server.getApiSpec());
  });
});
```

### `createUnexpectedHttpErrorLogger`

An error logger that logs the error only when the HTTP status code is not the
expected HTTP status code. This is useful when writing tests for error
responses:

- When we don't want any error messages printed to the console when the server
  responds with the expected error and the test passes.

- When something else goes wrong and the server returns an unexpected error
  status code, and we do want an error message to be printed to the console so
  that we have enough information to troubleshoot the failing test.

```ts
import {createUnexpectedHttpErrorLogger} from '@loopback/testlab';
import {RestApplication} from '@loopback/rest';

describe('MyApp', () => {
  it('does not log a known 401 error to console', async () => {
    const app = new RestApplication();

    const errorLogger = createUnexpectedHttpErrorLogger(401);
    // binds the custom error logger
    app.bind(SequenceActions.LOG_ERROR).to(errorLogger);

    const spec = {
      responses: {
        /*...*/
      },
    };
    function throwUnauthorizedError() {
      throw new HttpErrors.Unauthorized('Unauthorized!');
    }

    app.route('get', '/', spec, throwUnauthorizedError);

    await app.start();
    // make `GET /` request, assert that 401 is returned
  });
});
```

### TestSandbox

Many tests need use a temporary directory as the sandbox to mimic a tree of
files. The `TestSandbox` class provides such facilities to create and manage a
sandbox on the file system.

#### Create a sandbox

```ts
// Create a sandbox as a unique temporary subdirectory under the rootPath
const sandbox = new TestSandbox(rootPath);
const sandbox = new TestSandbox(rootPath, {subdir: true});

// Create a sandbox in the root path directly
// This is same as the old behavior
const sandbox = new TestSandbox(rootPath, {subdir: false});

// Create a sandbox in the `test1` subdirectory of the root path
const sandbox = new TestSandbox(rootPath, {subdir: 'test1'});

// To access the target directory of a sandbox
console.log(sandbox.path);
```

#### Reset a sandbox

All files inside a sandbox will be removed when the sandbox is reset. We also
try to remove cache from `require`.

```ts
await sandbox.reset();
```

#### Delete a sandbox

Removes all files and mark the sandbox unusable.

```ts
await sandbox.delete();
```

#### Create a directory

Recursively creates a directory within the sandbox.

```ts
await sandbox.mkdir(dir);
```

#### Copy a file

Copies a file from src to the TestSandbox. If copying a `.js` file which has an
accompanying `.js.map` file in the src file location, the dest file will have
its sourceMappingURL updated to point to the original file as an absolute path
so you don't need to copy the map file.

```ts
await sandbox.copyFile(src, dest);
```

#### Write a json file

Creates a new file and writes the given data serialized as JSON.

```ts
await sandbox.writeJsonFile(dest, data);
```

#### Write a file

Creates a new file and writes the given data as a UTF-8-encoded text.

```ts
await sandbox.writeFile(dest, data);
```

## Related resources

For more info about `supertest`, please refer to
[supertest](https://www.npmjs.com/package/supertest)

## Contributions

- [Guidelines](https://github.com/loopbackio/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/loopbackio/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/loopbackio/loopback-next/graphs/contributors).

## License

MIT
