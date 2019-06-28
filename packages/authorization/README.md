# @loopback/authorization

A LoopBack 4 component for authorization support.

## Overview

Authorization decides if a **subject** can perform specific **action** on an
**object**.

![Authorization](authorization.png)

### Role based

### Permission based

### Vote based

### Key building blocks

1. Decorate a method to describe:

- Permission (maps the method to an action on the protected resource)

  - Type of the protected resource (such as `customer` or `order`)
  - What action does the method represent (such as `changeEmail`, `createOrder`,
    or `cancelOrder`)

- ACL (provides role based rules)

  - allowedRoles
  - deniedRoles

- Voters (supplies a list of function to vote on the decision)

2. Intercept a method invocation

- Build authorization context

  - Subject (who) - from authentication
  - Map principals to roles
  - Inspect the target method for metadata - Permission, ACL, voters

- Run through voters/enforcers to make decisions

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
