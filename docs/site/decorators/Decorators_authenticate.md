---
lang: en
title: 'Authentication Decorator'
keywords: LoopBack 4.0, LoopBack-Next
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Decorators_authenticate.html
---

## Authentication Decorator

Syntax: `@authenticate(strategyName: string, options?: object)`

Marks a controller method as needing an authenticated user. This decorator
requires a strategy name as a parameter.

Here's an example using 'BasicStrategy': to authenticate user in function
`whoAmI`:

{% include code-caption.html content="src/controllers/who-am-i.controller.ts" %}

```ts
import {inject} from '@loopback/context';
import {
  AuthenticationBindings,
  UserProfile,
  authenticate,
} from '@loopback/authentication';
import {get} from '@loopback/rest';

export class WhoAmIController {
  constructor(
    @inject(AuthenticationBindings.CURRENT_USER) private user: UserProfile,
  ) {}

  @authenticate('BasicStrategy')
  @get('/whoami')
  whoAmI(): string {
    return this.user.id;
  }
}
```

Please note that `@authenticate` can also be applied at class level for all
methods within the class. In the code below, `whoAmI` is protected with
`BasicStrategy` (inherited from the class level) while `hello` does not require
authentication (skipped by `@authenticate.skip`).

```ts
@authenticate('BasicStrategy')
export class WhoAmIController {
  constructor(
    @inject(AuthenticationBindings.CURRENT_USER) private user: UserProfile,
  ) {}

  @get('/whoami')
  whoAmI(): string {
    return this.user.id;
  }

  @authenticate.skip()
  @get('/hello')
  hello(): string {
    return 'Hello';
  }
}
```

{% include note.html content="If only <b>some</b> of the controller methods are decorated with the <b>@authenticate</b> decorator, then the injection decorator for CURRENT_USER in the controller's constructor must be specified as <b>@inject(AuthenticationBindings.CURRENT_USER, {optional:true})</b> to avoid a binding error when an unauthenticated endpoint is accessed. Alternatively, do not inject CURRENT_USER in the controller <b>constructor</b>, but in the controller <b>methods</b> which are actually decorated with the <b>@authenticate</b> decorator. See [Method Injection](../Dependency-injection.md#method-injection), [Constructor Injection](../Dependency-injection.md#constructor-injection) and [Optional Dependencies](../Dependency-injection.md#optional-dependencies) for details.
" %}

For more information on authentication with LoopBack, visit
[here](../Loopback-component-authentication.md).
