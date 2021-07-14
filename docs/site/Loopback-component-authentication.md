---
lang: en
title: 'Authentication'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Authentication
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Loopback-component-authentication.html
---

## Overview

This document describes the details of the LoopBack 4 `Authentication` component
from the `@loopback/authentication` package.

It begins with the architecture of `@loopback/authentication` from high level.
Then comes with the sub-sections for each artifact provided by the component.
Each section shows:

- **How to use it in the application.** (Code that users need to add when use
  the module.)
- **The mechanism of that artifact.** (Code that explains the mechanism.)

Here is a **high level** overview of the authentication component.

![authentication_overview_highlevel](./imgs/authentication_overview_highlevel.png)

As illustrated in the diagram, this component includes:

- A decorator to express an authentication requirement on controller methods
- A provider to access method-level authentication metadata
- An action in the REST sequence to enforce authentication
- An extension point to discover all authentication strategies and handle the
  delegation

Then let's take a look of the **detailed** overview of the authentication
component.

![authentication_overview_detailed](./imgs/authentication_overview_detailed.png)

Basically, to secure your API endpoints, you need to:

- decorate the endpoints of a controller with the
  `@authenticate(strategyName, options?)` decorator (app developer)
- insert the authentication action in a custom sequence (app developer)
- create a custom authentication strategy with a unique **name** (extension
  developer)
- register the custom authentication strategy (app developer)

The **Authentication Component** takes care of the rest.

## Installation

```sh
npm install --save @loopback/authentication
```

## Mounting Authentication Component

To utilize `authentication` in an application `application.ts`, you must load
the authentication component named `AuthenticationComponent`.

```ts
import {AuthenticationComponent} from '@loopback/authentication';
//...
export class MyApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options?: ApplicationConfig) {
    super(options);

    //...
    // ------ ADD SNIPPET AT THE BOTTOM ---------
    // Mount authentication system
    this.component(AuthenticationComponent);
    // ------------- END OF SNIPPET -------------
    //...
  }
}
```

The `AuthenticationComponent` is defined as follows:

```ts
// ------ CODE THAT EXPLAINS THE MECHANISM ---------
export class AuthenticationComponent implements Component {
  providers?: ProviderMap;

  constructor() {
    this.providers = {
      [AuthenticationBindings.AUTH_ACTION.key]: AuthenticateActionProvider,
      [AuthenticationBindings.STRATEGY.key]: AuthenticationStrategyProvider,
      [AuthenticationBindings.METADATA.key]: AuthMetadataProvider,
    };
  }
}
```

As you can see, there are a few [providers](Creating-components.md#providers)
which make up the bulk of the authentication component.

Essentially

- The binding key `AuthenticationBindings.METADATA.key` is bound to
  `AuthMetadataProvider` which returns authentication decorator metadata of type
  `AuthenticationMetadata`
- The binding key `AuthenticationBindings.AUTH_ACTION.key` is bound to
  `AuthenticateActionProvider` which returns an authenticating function of type
  `AuthenticateFn`
- The binding key `AuthenticationBindings.STRATEGY.key` is bound to
  `AuthenticationStrategyProvider` which resolves and returns an authentication
  strategy of type `AuthenticationStrategy`

The purpose of these providers and the values they return will be explained in
the sections below.

## Navigation

Next topic: [Authentication Decorator](Authentication-component-decorator.md)
