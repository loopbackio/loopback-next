---
lang: en
title: 'Authentication Decorator'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Authentication-component-decorator.html
---

## Authentication Decorator

The decorators in LoopBack 4 are no different to the standard decorators in
TypeScript. They add metadata to classes, methods, properties, or parameters.
They don't actually add any functionality, only metadata.

Securing your application's API endpoints is done by decorating **controller**
functions with the
[Authentication Decorator](decorators/Decorators_authenticate.md).

The decorator's syntax is:

```ts
@authenticate(strategyName: string, options?: object)
```

or

```ts
@authenticate(metadata: AuthenticationMetadata)
```

The **`strategyName`** is the **unique** name of the authentication strategy.

When the **`options`** object is specified, it must be relevant to that particular
strategy.

Here is an example of the decorator using a custom authentication strategy named
**'basic'** without options, for the endpoint `/whoami` in a controller named
`WhoAmIController`. (We will register an existing **'basic'** authentication
strategy in later section
[Authentication Strategy](Authentication-component-strategy.md))

```ts
import {inject} from '@loopback/context';
import {AuthenticationBindings, authenticate} from '@loopback/authentication';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {get} from '@loopback/rest';

export class WhoAmIController {
  constructor(
    // `AuthenticationBindings.CURRENT_USER` is now an alias of
    // `SecurityBindings.USER` in @loopback/security
    // ------ ADD SNIPPET ---------
    @inject(SecurityBindings.USER)
    private userProfile: UserProfile,
    // ------------- END OF SNIPPET -------------
  )
  {}

  // ------ ADD SNIPPET ---------
  @authenticate('basic')
  @get('/whoami')
  whoAmI(): string {
    // `securityId` is Symbol to represent the security id of the user,
    // typically the user id. You can find more information of `securityId` in
    // https://loopback.io/doc/en/lb4/Security
    return this.userProfile[securityId];
  }
  // ------------- END OF SNIPPET -------------
}
```

{% include note.html content="If only <b>some</b> of the controller methods are decorated with the <b>@authenticate</b> decorator, then the injection decorator for SecurityBindings.USER in the controller's constructor must be specified as <b>@inject(SecurityBindings.USER, {optional:true})</b> to avoid a binding error when an unauthenticated endpoint is accessed. Alternatively, do not inject SecurityBindings.USER in the controller <b>constructor</b>, but in the controller <b>methods</b> which are actually decorated with the <b>@authenticate</b> decorator. See [Method Injection](Dependency-injection.md#method-injection), [Constructor Injection](Dependency-injection.md#constructor-injection) and [Optional Dependencies](Dependency-injection.md#optional-dependencies) for details.
" %}

An example of the decorator when options **are** specified looks like this:

```ts
@authenticate('basic', { /* some options for the strategy */})
```

{% include tip.html content="
To avoid repeating the same options in the <b>@authenticate</b> decorator for many endpoints in a controller, you can instead define global options which can be injected into an authentication strategy thereby allowing you to avoid specifying the options object in the decorator itself. For controller endpoints that need to override a global option, you can specify it in an options object passed into the decorator. Your authentication strategy would need to handle the option overrides. See [Managing Custom Authentication Strategy Options](Loopback-component-options.md) for details.
" %}

After a request is successfully authenticated, the current user profile is
available on the request context. You can obtain it via dependency injection by
using the `SecurityBindings.USER` binding key.

Parameters of the `@authenticate` decorator can be obtained via dependency
injection using the `AuthenticationBindings.METADATA` binding key. It returns
data of type `AuthenticationMetadata` provided by `AuthMetadataProvider`. The
`AuthenticationStrategyProvider`, discussed in a later section, makes use of
`AuthenticationMetadata` to figure out what **name** you specified as a
parameter in the `@authenticate` decorator of a specific controller endpoint.

## Navigation

Next topic: [Authentication Action](Authentication-component-action.md)

Previous topic:
[Authentication Component Overview](LoopBack-component-authentication.md)
