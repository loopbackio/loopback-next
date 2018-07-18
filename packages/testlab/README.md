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
- [itSkippedOnTravis](#itskippedontravis) - Skip tests on Travis env.
- [givenHttpServerConfig](#givenhttpserverconfig) - Generate HTTP server config.
- [httpGetAsync](#httpgetasync) - Async wrapper for HTTP GET requests.
- [httpsGetAsync](#httpsgetasync) - Async wrapper for HTTPS GET requests.

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

### `itSkippedOnTravis`

Helper function for skipping tests on Travis environment. If you need to skip
testing on Travis for any reason, use this instead of Mocha's `it`.

### `givenhttpserverconfig`

Helper function for generating Travis-friendly host (127.0.0.1). This is
required because Travis is not able to handle IPv6 addresses.

### `httpgetasync`

Async wrapper for making HTTP GET requests.

```ts
import {httpGetAsync} from '@loopback/testlab';
const response = await httpGetAsync('http://example.com');
```

### `httpsgetasync`

Async wrapper for making HTTPS GET requests.

```ts
import {httpsGetAsync} from '@loopback/testlab';
const response = await httpsGetAsync('https://example.com');
```

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

## Related resources

For more info about `supertest`, please refer to
[supertest](https://www.npmjs.com/package/supertest)

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
