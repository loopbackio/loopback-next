# LoopBack Test Lab

A collection of test utilities we use to write LoopBack tests.

## Overview

Test utilities to help writing LoopBack 4 tests:
- `expect` - behavior-driven development (BDD) style assertions
- `sinon`
   - test spies: functions recording arguments and other information for all of their calls
   - stubs: functions (spies) with pre-programmed behavior
   - mocks: fake methods (like spies) with pre-programmed behavior (like stubs) as well as pre-programmed expectations
- Helpers for creating `supertest` clients for LoopBack applications
- HTTP request/response stubs for writing tests without a listening HTTP server
- Swagger/OpenAPI spec validation

## Installation

```
$ npm install --save-dev @loopback/testlab
```

_This package is typically used in tests, save it to `devDependencies` via `--save-dev`._

## Basic use

```ts
import { expect } from '@loopback/testlab';

describe('Basic assertions', => {
  it('asserts equal values', => {
    expect({key:'value'}).to.deepEqual({key: 'value'});
    expect.exists(1);
  })
});
```

## API documentation

### `expect`

[Should.js](https://shouldjs.github.io/) configured in "as-function" mode
(global `Object.prototype` is left intact) with an extra chaining word `to`.

### `sinon`

Spies, mocks and stubs. Learn more at [http://sinonjs.org/](http://sinonjs.org/).

### `shot`

Shot [API Reference](https://github.com/hapijs/shot/blob/master/API.md)

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
  })
});
```

## Related resources

For more info about `supertest`, please refer to [supertest](https://www.npmjs.com/package/supertest)

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/DEVELOPING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

run 'npm test' from the root folder.

## Contributors

See [all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
