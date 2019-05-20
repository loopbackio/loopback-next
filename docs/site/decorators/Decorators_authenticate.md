---
lang: en
title: 'Authentication Decorator'
keywords: LoopBack 4.0, LoopBack-Next
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Decorators_authenticate.html
---

## Authentication Decorator

Syntax: `@authenticate(strategyName: string, options?: Object)`

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

For more information on authentication with LoopBack, visit
[here](https://github.com/strongloop/loopback-next/blob/master/packages/authentication/README.md).
