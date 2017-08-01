# LoopBack Test Lab

A collection of test utilities we use to write LoopBack tests.

## Overview

Test utilities to help writing loopback-next tests:
- `expect` - behavior-driven development (BDD) style assertions
- `sinon`
   - test spies: functions recording arguments and other information for all of their calls
   - stubs: functions (spies) with pre-programmed behavior
   - mocks: fake methods (like spies) with pre-programmed behavior (like stubs) as well as pre-programmed expectations
- Helpers for creating `supertest` clients for LoopBack applications
- HTTP request/response stubs for writing tests without a listening HTTP server

## Installation

```
$ npm install --save-dev @loopback/testlab
```
```
_This package is typically used in tests, save it to `devDependencies` via `--save-dev`._
```

## Basic use

```ts
import { expect } from '@loopback/testlab';

expect({key:'value'}).to.deepEqual({key: 'value'});
expect.exists(1);
```

## API documentation

### `expect`

[Should.js](https://shouldjs.github.io/) configured in "as-function" mode
(global `Object.prototype` is left intact) with an extra chaining word `to`.

### `sinon`

Spies, mocks and stubs. Learn more at [http://sinonjs.org/](http://sinonjs.org/).

### `shot`

Shot [API Reference](https://github.com/hapijs/shot/blob/master/API.md)

## Related resources

For more info about `supertest`, please refer to [supertest](https://www.npmjs.com/package/supertest)

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/wiki/Contributing##guidelines)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

run 'npm test' from the root folder.

## Contributors

See [all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
