---
lang: en
title: 'Authentication Decorator'
keywords:
  LoopBack 4.0, LoopBack, Node.js, TypeScript, OpenAPI, Decorator,
  Authentication
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Decorators_authenticate.html
---

## Authentication Decorator

Syntax:

- single strategy: `@authenticate(strategyName)`
- multiple strategies: `@authenticate(strategyName1, strategyName2)`
- single strategy with options:
  ```ts
    @authenticate({
      strategy: strategyName,
      options: {option1: 'value1', option2: 'value2'}
    })
  ```
- multiple strategies with options:
  ```ts
    @authenticate({
      strategy: strategyName1,
      options: {option1: 'value1'}
    }, {
      strategy: strategyName2,
      options: {option2: 'value2'}
    })
  ```

To mark a controller method as needing an authenticated user, the decorator
requires one or more strategies.

### Method Level Decorator

Here's an example using 'BasicStrategy': to authenticate user in function
`whoAmI`:

{% include code-caption.html content="src/controllers/who-am-i.controller.ts" %}

```ts
import {inject} from '@loopback/core';
import {securityId, SecurityBindings, UserProfile} from '@loopback/security';
import {authenticate} from '@loopback/authentication';
import {get} from '@loopback/rest';

export class WhoAmIController {
  constructor(@inject(SecurityBindings.USER) private user: UserProfile) {}

  @authenticate('BasicStrategy')
  @get('/whoami')
  whoAmI(): string {
    return this.user[securityId];
  }
}
```

### Class Level Decorator

To configure a default authentication for all methods within a class,
`@authenticate` can also be applied at the class level. In the code below,
`whoAmI` is protected with `BasicStrategy` even though there is no
`@authenticate` is present for the method itself. The configuration is inherited
from the class. The `hello` method does not require authentication as it's
skipped by `@authenticate.skip`.

```ts
@authenticate('BasicStrategy')
export class WhoAmIController {
  constructor(@inject(SecurityBindings.USER) private user: UserProfile) {}

  @get('/whoami')
  whoAmI(): string {
    return this.user[securityId];
  }

  @authenticate.skip()
  @get('/hello')
  hello(): string {
    return 'Hello';
  }
}
```

{% include note.html content="If only <b>some</b> of the controller methods are decorated with the <b>@authenticate</b> decorator, then the injection decorator for SecurityBindings.USER in the controller's constructor must be specified as <b>@inject(SecurityBindings.USER, {optional:true})</b> to avoid a binding error when an unauthenticated endpoint is accessed. Alternatively, do not inject SecurityBindings.USER in the controller <b>constructor</b>, but in the controller <b>methods</b> which are actually decorated with the <b>@authenticate</b> decorator. See [Method Injection](../Dependency-injection.md#method-injection), [Constructor Injection](../Dependency-injection.md#constructor-injection) and [Optional Dependencies](../Dependency-injection.md#optional-dependencies) for details.
" %}

For more information on authentication with LoopBack, visit
[here](../Loopback-component-authentication.md).

### Multiple Strategies

`@authenticate()` can takes in more than one strategy. For example:

```ts
import {inject} from '@loopback/core';
import {securityId, SecurityBindings, UserProfile} from '@loopback/security';
import {authenticate} from '@loopback/authentication';
import {get} from '@loopback/rest';

export class WhoAmIController {
  constructor(@inject(SecurityBindings.USER) private user: UserProfile) {}

  @authenticate('BasicStrategy', 'JWTStrategy')
  @get('/whoami')
  whoAmI(): string {
    return this.user[securityId];
  }
}
```

The logic on how the strategies are executed is similar to how
[passport.js](http://www.passportjs.org/) does it:

- The authentication strategies will be executed in the provided order.
- If at least one authentication strategy succeeds, the request will be further
  processed without throwing an error.
- Once a strategy succeeds or redirects, all subsequent strategies will not be
  evaluated.
- If all strategies fail, an error will be thrown with the error message of the
  first provided strategy.

{% include note.html content="It is not feasible to use multiple strategies that redirect (e.g. OAuth login redirects) since the first redirect will halt the execution chain.
" %}
