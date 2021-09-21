---
lang: en
title: 'Authorization Component - Authorizer'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Authorization
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Authorization-component-authorizer.html
---

Users are expected to program policies that enforce access control in two of the
following options:

- `Authorizer` functions
  - The authorizer functions are applied globally, i.e, they are enforced on all
    endpoints in the application
- `Voter` functions
  - voters are specific for the endpoint that is decorated with it
  - multiple voters can be configured for an endpoint

> Usually the `authorize` functions are bound through a provider as below

- The `AuthorizationContext` parameter of the `authorize` function contains the
  current principal (in the example given above,that would be the current user
  invoking `cancelOrder`) and details of the invoked endpoint.
  - The `AuthorizationMetadata` parameter of the `authorize` function contains
    all the details provided in the invoked method's decorator.

```ts
class MyAuthorizationProvider implements Provider<Authorizer> {
  /**
   * @returns an authorizer function
   *
   */
  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    context: AuthorizationContext,
    metadata: AuthorizationMetadata,
  ) {
    events.push(context.resource);
    if (
      context.resource === 'OrderController.prototype.cancelOrder' &&
      context.principals[0].name === 'user-01'
    ) {
      return AuthorizationDecision.DENY;
    }
    return AuthorizationDecision.ALLOW;
  }
}
```

> the `authorize` function is then tagged to an application as
> `AuthorizationTags.AUTHORIZER` as below.

{% include code-caption.html content="src/application.ts" %}

```ts
export class MyApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    const authoptions: AuthorizationOptions = {
      precedence: AuthorizationDecision.DENY,
      defaultDecision: AuthorizationDecision.DENY,
    };

    // mount authorization component
    const binding = this.component(AuthorizationComponent);
    // configure authorization component
    this.configure(binding.key).to(authoptions);
    
    // bind the authorizer provider
    this.bind('authorizationProviders.my-authorizer-provider')
      .toProvider(MyAuthorizationProvider)
      .tag(AuthorizationTags.AUTHORIZER);
  }
}
```

- This creates a list of `authorize()` functions.
  - The `authorize(AuthorizationContext, AuthorizationMetadata)` function in the
    provider class is expected to be called by the `Authorization Interceptor`
    which is called for every API endpoint decorated with `@authorize()`.
  - The authorize interceptor gets the list of functions tagged with
    `AuthorizationTags.AUTHORIZER` (and also the voters listed in the
    `@authorize` decorator per endpoint) and calls the functions one after
    another.
  - The `authorize()` function is expected to return an object of type
    `AuthorizationDecision`. If the type returned is
    `AuthorizationDecision.ALLOW` the current `Principal` has passed the
    executed `authorize()` function's criteria.

> Voter functions are directly provided in the decorator of the remote method

```ts
  async function compareId(
    authorizationCtx: AuthorizationContext,
    metadata: MyAuthorizationMetadata,
  ) {
    let currentUser: UserProfile;
    if (authorizationCtx.principals.length > 0) {
      const user = _.pick(authorizationCtx.principals[0], [
        'id',
        'name',
        'email',
      ]);
      return AuthorizationDecision.ALLOW;
    } else {
      return AuthorizationDecision.DENY;
    }
  }

  @authenticate('jwt')
  @authorize({resource: 'order', scopes: ['patch'], voters: [compareId]})
  async patchOrders(
    @param.path.string('userId') userId: string,
    @requestBody() order: Partial<Order>,
    @param.query.string('where') where?: Where<Order>,
  ): Promise<Count> {
    return this.userRepo.orders(userId).patch(order, where);
  }
```

In the above example `compareId()` is an authorizing function which is provided
as a voter in the decorator for the `patchOrders()` method.
