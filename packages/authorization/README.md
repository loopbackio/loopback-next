# @loopback/authorization

A LoopBack 4 component for authorization support.

**This is a reference implementation showing how to implement an authorization
component, it is not production ready.**

## Overview

## Installation

```shell
npm install --save @loopback/authorization
```

## Basic use

Start by decorating your controller methods with `@authorize` to require the
request to be authorized.

In this example, we make the user profile available via dependency injection
using a key available from `@loopback/authorization` package.

```ts
import {inject} from '@loopback/context';
import {authorize} from '@loopback/authorization';
import {get} from '@loopback/rest';

export class MyController {
  @authorize({allow: ['ADMIN']})
  @get('/number-of-views')
  numOfViews(): number {
    return 100;
  }
}
```

## Related resources

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
