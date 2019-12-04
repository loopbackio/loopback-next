# @loopback/authorization

A LoopBack 4 component for authorization support (Role based, Permission based,
Vote based)

To read on key building blocks read through
[loopback authorization docs](https://loopback.io/doc/en/lb4/Loopback-component-authorization.html)

![Authorization](authorization.png)

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

## Extract common layer

`@loopback/authentication` and `@loopback/authorization` share the client
information from the request. Therefore we have created another module,
`@loopback/security` with types/interfaces that describe the client, like
`principles`, `userProfile`, etc.

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
