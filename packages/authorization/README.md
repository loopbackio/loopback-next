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

## Decision matrix

The final decision is controlled by voting results from authorizers and options
for the authorization component.

The following table illustrates the decision matrix with 3 voters and
corresponding options.

| Vote #1 | Vote # 2 | Vote #3 | Options                  | Final Decision |
| ------- | -------- | ------- | ------------------------ | -------------- |
| Deny    | Deny     | Deny    | **any**                  | Deny           |
| Allow   | Allow    | Allow   | **any**                  | Allow          |
| Abstain | Allow    | Abstain | **any**                  | Allow          |
| Abstain | Deny     | Abstain | **any**                  | Deny           |
| Deny    | Allow    | Abstain | {precedence: Deny}       | Deny           |
| Deny    | Allow    | Abstain | {precedence: Allow}      | Allow          |
| Allow   | Abstain  | Deny    | {precedence: Deny}       | Deny           |
| Allow   | Abstain  | Deny    | {precedence: Allow}      | Allow          |
| Abstain | Abstain  | Abstain | {defaultDecision: Deny}  | Deny           |
| Abstain | Abstain  | Abstain | {defaultDecision: Allow} | Allow          |

The `options` is described as follows:

```ts
export interface AuthorizationOptions {
  /**
   * Default decision if all authorizers vote for ABSTAIN
   */
  defaultDecision?: AuthorizationDecision.DENY | AuthorizationDecision.ALLOW;
  /**
   * Controls if Allow/Deny vote takes precedence and override other votes
   */
  precedence?: AuthorizationDecision.DENY | AuthorizationDecision.ALLOW;
}
```

The authorization component can be configured with options:

```ts
const options: AuthorizationOptions = {
  precedence: AuthorizationDecisions.DENY;
  defaultDecision: AuthorizationDecisions.DENY;
}

const binding = app.component(AuthorizationComponent);
app.configure(binding.key).to(options);
```

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

Please note that `@authorize` can also be applied at class level for all methods
within the class. In the code below, `numOfViews` is protected with
`BasicStrategy` (inherited from the class level) while `hello` does not require
authorization (skipped by `@authorize.skip`).

```ts
@authorize({allow: ['ADMIN']})
export class MyController {
  @get('/number-of-views')
  numOfViews(): number {
    return 100;
  }

  @authorize.skip()
  @get('/hello')
  hello(): string {
    return 'Hello';
  }
}
```

## Extract common layer(TBD)

`@loopback/authentication` and `@loopback/authorization` shares the client
information from the request. Therefore we need another module with
types/interfaces that describe the client, like `principles`, `userProfile`,
etc... A draft PR is created for this module: see branch
https://github.com/strongloop/loopback-next/tree/security/packages/security

Since the common module is still in progress, as the first release of
`@loopback/authorization`, we have two choices to inject a user in the
interceptor:

- `@loopback/authorization` requires `@loopback/authentication` as a dependency.
  The interceptor injects the current user using
  `AuthenticationBindings.CURRENT_USER`. Then we remove this dependency in the
  common layer PR, two auth modules will depend on `@loopback/security`.

  - This is what's been done in my refactor PR, `Principle` and `UserProfile`
    are still decoupled, I added a convertor function to turn a user profile
    into a principle.

- The interceptor injects the user using another key not related to
  `@loopback/authentication`.(_Which means the code that injects the user stays
  as it is in https://github.com/strongloop/loopback-next/pull/1205_). Then we
  unify the user set and injection in the common layer PR: same as the 1st
  choice, two auth modules will depend on `@loopback/security`.

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
