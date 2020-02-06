---
lang: en
title: 'Authorization'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Loopback-component-authorization.html
---

## Overview

> Wikipedia: Authorization is the function of specifying access
> rights/privileges to resources

LoopBack's highly extensible authorization package
[@loopback/authorization](https://github.com/strongloop/loopback-next/tree/master/packages/authorization)
provides various features and provisions to check access rights of a client on a
API endpoint.

API clients login to get a credential (can be a token, api-key, claim or cert).
When the client calls an API endpoint, they pass the credential in the request
to identify themselves (Authentication) as well as claim their access rights
(Authorization).

LoopBack's authorization component checks if the permissions associated with the
credential provided by the client satisfies the accessibility criteria defined
by the users.

## Design

A `Principal` could be a User, Application or Device. The `Principal` is
identified from the credential provided by a client, by the configured
`Authentication strategy` of the endpoint
([see, LoopBack Authentication](https://loopback.io/doc/en/lb4/Loopback-component-authentication.html)).
Access rights of the client is either associated with or included in the
credential.

The `Principal` is then used by LoopBack's authorization mechanism to enforce
necessary privileges/access rights by using the permissions annotated by the
`@authorize` decorator on the controller methods.

![Authorization](./imgs/authorization.png)

The expectations from various stake holders (LoopBack, Architects, Developers)
for implementation of the authorization features are given below in the
[Chain of Responsibility](#chain-of-responsibility) section.

## Chain of Responsibility

LoopBack as a framework provides certain provisions and expects the developers
to extend with their specific implementations. Architects or Security analysts
generally provide security policies to clarify how the developers should
approach authorization.

`The framework` provides,

- the `@authorize` decorator to provide authorization metadata and voters
- various `types` and `interfaces` to declare user provided `artifacts`
- a mechanism to enforce authorization policies
  - abstractions of `authorizers` as user provided functions and voters
  - create a decision matrix to combine results of all user provided
    `authorizers`
  - an interceptor which enforces policies by creating the decision matrix
- a LoopBack authorization component which packs all the above

`Architects` should,

- separate global authorization concerns as `authorizers`
- identify specific responsibilities of an endpoint as `voters`
- provide security policies for conflicting decisions from `authorizers` and
  `voters`
- provide authentication policies with necessary scopes and roles for every
  endpoint

`Developers` need to,

- mount the authorization component, see
  [Registering the Authorization Component](#registering-the-authorization-component)
- decorate endpoints with authorization metadata, see
  [Configuring API Endpoints](#configuring-api-endpoints)
- define `authorizer` and `voter` functions, see
  [Programming Access Policies](#programming-access-policies)
- design security policies as decision matrix, see
  [Authorization by decision matrix](#authorization-by-decision-matrix)
- plug in external enforcer libraries, see
  [Enforcer Libraries](#enforcer-libraries)

## Registering the Authorization Component

The `@loopback/authorization` package exports an
[Authorization Component](https://github.com/strongloop/loopback-next/blob/master/packages/authorization/src/authorization-component.ts)
class.

- Developers will have to register this component to use access control features
  in their application.

  ```ts
  const options: AuthorizationOptions = {
    precedence: AuthorizationDecision.DENY,
    defaultDecision: AuthorizationDecision.DENY,
  };

  app.configure(AuthorizationBindings.COMPONENT).to(options);
  app.component(AuthorizationComponent);
  ```

- The authorization `options` are provided specifically for enforcing the
  [decision matrix](#authorization-by-decision-matrix), which is used to combine
  voters from all `authorize` functions. The options are described per the
  interface AuthorizationOptions.

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

The component also declares various
[types](https://github.com/strongloop/loopback-next/blob/master/packages/authorization/src/types.ts)
to use in defining necessary classes and inputs by developers.

- `Authorizer`: A class implementing access policies. Accepts
  `AuthorizationContext` and `AuthorizationMetadata` as input and returns an
  `AuthorizationDecision`.

- `AuthorizationDecision`: expected type to be returned by an `Authorizer`

- `AuthorizationMetadata`: expected type of the authorization spec passed to the
  decorator used to annotate a controller method. Also provided as input
  parameter to the `Authorizer`.

- `AuthorizationContext`: contains current principal invoking an endpoint,
  request context and expected roles and scopes.

- `Enforcer`: type of extension classes that provide authorization services for
  an `Authorizer`.

- `AuthorizationRequest`: type of the input provided to an `Enforcer`.

- `AuthorizationError`: expected type of the error thrown by an `Authorizer`.

## Authorization Interceptor

The `Authorization Component` once registered binds an in-built interceptor to
all API calls.

The `Authorization interceptor` enforces authorization with user-provided
`authorizers/voters`

- The interceptor checks to see if an endpoint is annotated with an
  authorization specification.
- It collects all functions tagged as `Authorizer`. The interceptor also
  collects `voters` provided in the `@authorize` decorator of the endpoint.
- It executes each of the above collected functions provided by the user.
- Based on the result of all functions it enforces access/privilege control
  using [a decision matrix](#authorization-by-decision-matrix).

## Configuring API Endpoints

Users can annotate the controller methods with access specifications using an
`authorize` decorator. The access specifications are defined as per type
[AuthorizationMetadata](https://github.com/strongloop/loopback-next/blob/master/packages/authorization/src/types.ts)
which consists of the following:

- type of the protected resource (such as customer or order)
- allowed roles and denied roles (to provide ACL based rules)
- scopes (oauth scopes such as `delete public images` or `register user`)
- voters (supply a list of functions to vote on a decision about a subject's
  accessibility)

```ts
  @post('/users/{userId}/orders', {
    responses: {
      '200': {
        description: 'User.Order model instance',
        content: {'application/json': {schema: {'x-ts-type': Order}}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({resource: 'order', scopes: ['create']})
  async createOrder(
    @param.path.string('userId') userId: string,
    @requestBody() order: Order,
  ): Promise<Order> {
    await this.userRepo.orders(userId).create(order);
  }
```

Please note that `@authorize` can also be applied at class level for all methods
within the class. In the code below remote method `numOfViews()` is protected
with `ADMIN` role, while authorization for remote method `hello()` is skipped by
`@authorize.skip()`.

```ts
@authorize({allowedRoles: ['ADMIN']})
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

## Programming Access Policies

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

```ts
import AuthorizationTags from '@loopback/authorization';
let app = new Application();
app
  .bind('authorizationProviders.my-provider')
  .toProvider(MyAuthorizationProvider)
  .tag(AuthorizationTags.AUTHORIZER);
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

## Authorization by decision matrix

The final decision to allow access for a subject is done by the interceptor by
creating a decision matrix from the voting results (from all the `authorizer`
and `voter` functions of an endpoint).

The following table illustrates an example decision matrix with 3 votes and
corresponding options.

| Authorizer | Voter # 1 | Voter #2 | Options                  | Final Decision |
| ---------- | --------- | -------- | ------------------------ | -------------- |
| Deny       | Deny      | Deny     | **any**                  | Deny           |
| Allow      | Allow     | Allow    | **any**                  | Allow          |
| Abstain    | Allow     | Abstain  | **any**                  | Allow          |
| Abstain    | Deny      | Abstain  | **any**                  | Deny           |
| Deny       | Allow     | Abstain  | {precedence: Deny}       | Deny           |
| Deny       | Allow     | Abstain  | {precedence: Allow}      | Allow          |
| Allow      | Abstain   | Deny     | {precedence: Deny}       | Deny           |
| Allow      | Abstain   | Deny     | {precedence: Allow}      | Allow          |
| Abstain    | Abstain   | Abstain  | {defaultDecision: Deny}  | Deny           |
| Abstain    | Abstain   | Abstain  | {defaultDecision: Allow} | Allow          |

- Here, if suppose there is an `authorizer` function and 2 voters for an
  endpoint.
  - if the `authorizer` function returns `ALLOW`, but voter 1 in authorize
    decorator returns `ABSTAIN` and voter 2 in decorator returns `DENY`.
  - In this case, if the options provided while
    [registering the authorization component](#authorization-component),
    provides precedence as `DENY`, then the access for the subject is denied to
    the endpoint.

## Enforcer Libraries

Enforcer libraries help developers in coding security policies as configurations
and provides out-of-the-box matching rules, strategies and authorization
patterns. These libraries also help with mundane tasks like mapping user
profiles to scopes and roles, modifying configurations dynamically, etc. Please
look at the
[loopback shopping example](https://github.com/strongloop/loopback4-example-shopping)
to see how [CasBin library](https://github.com/casbin/casbin) is
[injected as an enforcer](https://github.com/strongloop/loopback4-example-shopping/pull/231)
into the authorization provider.

```ts
import * as casbin from 'casbin';

// Class level authorizer
export class CasbinAuthorizationProvider implements Provider<Authorizer> {
  constructor(@inject('casbin.enforcer') private enforcer: casbin.Enforcer) {}

  /**
   * @returns authorizeFn
   */
  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    authorizationCtx: AuthorizationContext,
    metadata: AuthorizationMetadata,
  ) {

    /*
    * call enforcer and determine action
    */
    return AuthorizationDecision.ABSTAIN;
  }
```
