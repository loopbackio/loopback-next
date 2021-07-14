# @loopback/openapi-v3

This package contains:

- Decorators that describe LoopBack artifacts as OpenAPI 3.0.0 metadata.
- Utilities that transfer LoopBack metadata to OpenAPI 3.0.0 specifications.

## Overview

The package has functions described above for LoopBack controller classes.
Decorators apply REST api mapping metadata to controller classes and their
members. And utilities that inspect controller classes to build OpenAPI 3.0.0
specifications from REST API mapping metadata.

Functions for more artifacts will be added when we need.

## Installation

```sh
npm install --save @loopback/openapi-v3
```

## Basic use

Currently this package only has spec generator for controllers. It generates
OpenAPI specifications for a given decorated controller class, including
`paths`, `components.schemas`, and `servers`.

Here is an example of calling function `getControllerSpec` to generate the
OpenAPI spec:

```ts
import {get, getControllerSpec} from '@loopback/openapi-v3';

class MyController {
  @get('/greet')
  greet() {
    return 'Hello world!';
  }
}

const myControllerSpec = getControllerSpec(MyController);
```

then the `myControllerSpec` will be:

```ts
{
  paths: {
    '/greet': {
      get: {
        'x-operation-name': 'greet'
      }
    }
  },
}
```

For details of how to apply controller decorators, please check
<http://loopback.io/doc/en/lb4/Decorators.html#route-decorators>

## Related resources

See <https://www.openapis.org/> and
[version 3.0.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md)
of OpenAPI Specification.

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
