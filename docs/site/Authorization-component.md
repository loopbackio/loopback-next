---
lang: en
title: 'Authorization Component'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Authorization
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Loopback-component-authorization.html
---

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
