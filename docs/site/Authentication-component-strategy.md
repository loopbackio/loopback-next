---
lang: en
title: 'Authentication Strategy'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Authentication-component-strategy.html
---

## Authentication Strategy

`AuthenticationStrategy` is a standard interface that the
`@loopback/authentication` package understands. Hence, any authentication
strategy that adopts this interface can be used with `@loopback/authentication`.
Think of it like the standard interface for
[Passport.js](http://www.passportjs.org/packages/passport-npm/) uses to
interface with many different authentication strategies.

With a **common** authentication strategy interface and an
[**extensionPoint/extensions**](Extension-point-and-extensions.md) pattern used
to **register** and **discover** authentication strategies, users can bind
**multiple strategies** to an application.

The component has a default authentication strategy provider which discovers the
registered strategies by name. It automatically searches with the name given in
an endpoint's `@authenticate()` decorator, then returns the corresponding
strategy for the authentication action to proceed.

It's usually **extension developer**'s responsibility to provide an
authentication strategy as provider. To simplify the tutorial, we leverage an
existing strategy from file
[basic authentication strategy](https://github.com/strongloop/loopback-next/blob/master/packages/authentication/src/__tests__/fixtures/strategies/basic-strategy.ts)
to show users how to register (bind) an strategy to the application.

Before registering the `basic` strategy, please make sure the following files
are copied to your application:

- Copy
  [basic authentication strategy](https://github.com/strongloop/loopback-next/blob/master/packages/authentication/src/__tests__/fixtures/strategies/basic-strategy.ts)
  to `src/strategies/basic-strategy.ts`
- Copy
  [user service](https://github.com/strongloop/loopback-next/blob/master/packages/authentication/src/__tests__/fixtures/services/basic-auth-user-service.ts)
  to `src/services/basic-auth-user-service.ts`
  - Copy
    [user model](https://github.com/strongloop/loopback-next/blob/master/packages/authentication/src/__tests__/fixtures/users/user.ts)
    to `src/models/user.ts`
  - Copy
    [user repository](https://github.com/strongloop/loopback-next/blob/master/packages/authentication/src/__tests__/fixtures/users/user.repository.ts)
    to `src/repositories/user.repository.ts`

**Registering** `BasicAuthenticationStrategy` in an application `application.ts`
is as simple as:

```ts
import {registerAuthenticationStrategy} from '@loopback/authentication';

export class MyApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options?: ApplicationConfig) {
    super(options);

    //...
    // ------ ADD SNIPPET ---------
    registerAuthenticationStrategy(this, BasicAuthenticationStrategy);
    // ----- END OF SNIPPET -------
    //...
  }
}
```

## Navigation

Next topic:
[Managing Custom Authentication Strategy Options](Authentication-component-options.md)

Previous topic: [Authentication Action](Authentication-component-action.md)
