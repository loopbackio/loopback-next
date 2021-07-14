---
lang: en
title: 'Component'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Concepts
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Component.html
redirect_from:
  - /doc/en/lb4/Components.html
  - /doc/en/lb4/Using-components.html
---

## Overview

Components play an important role in the extensibility of LoopBack 4. A
Component makes it easy for independent developers to contribute additional
features to LoopBack. Components serve as a vehicle to group extension
contributions such as [Context Bindings](Context.md) and various artifacts to
allow easier extensibility of your Application.

A typical LoopBack component is an [npm](https://www.npmjs.com) package
exporting a Component class which can be added to your application.

Apart from its own properties, `Component` class can have the following
properties:

- `controllers` - An array of [controller](Controller.md) classes.
- `providers` - A map of providers to be bound to the application
  [context](Context.md).
- `classes` - A map of TypeScript classes to be bound to the application
  context.
- `servers` - A map of name/class pairs for [servers](Server.md).
- `lifeCycleObservers` - An array of [life cycle observers](Life-cycle.md).
- `services` - An array of [service](Service.md) classes or providers.
- `bindings` - An array of [bindings](Binding.md) to be added to the application
  context. A good example of using bindings to extend the functionality of a
  LoopBack 4 app is
  [contributing an additional body parser](Extending-request-body-parsing.html#contribute-a-body-parser-from-a-component).

These properties contribute to the application to add additional features and
capabilities.

LoopBack 4 was built with extensibility in mind and this includes Components,
which can be allowed to contribute additional artifacts by adding a Mixin to
your Application class. This doesn't change how a Component is registered
(`app.component()`) but it enables the Component to contribute additional
artifacts. For example:

- [Repositories](Repository.md) can be contributed by a Component by adding
  `RepositoryMixin` from `@loopback/repository` to your Application
- [Booters](Booting-an-Application.md#booters) can be contributed by a Component
  by adding `BootMixin` from `@loopback/boot` to your Application

![Components](imgs/loopback-component.png)

{% include note.html content="
Always check a component's instructions to see if it requires the use
of a Mixin. A Mixin may automatically register a Component, saving you the
trouble of having to do so manually. Again it's best to check the documentation
for the given Component/Mixin.
" %}

## Component life cycle

A component will be instantiated when `app.component()` is called. A component
class can use its constructor and properties to contribute bindings to the
hosting application. Dependency injection is supported, for example, to access
the hosting application. But you have to make sure that all dependencies can be
resolved synchronously when `app.component()` is invoked.

```ts
import {
  Component,
  LifeCycleObserver,
  CoreBindings,
  inject,
} from '@loopback/core';

export class MyComponent implements Component, LifeCycleObserver {
  status = 'not-initialized';
  initialized = false;

  // Contribute bindings via properties
  controllers = [];
  bindings = [];

  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) private app) {
    // Contribute bindings via constructor
    this.app.bind('foo').to('bar');
  }
}
```

In some cases, a component may need to contribute bindings asynchronously. It
should then use the `init` method.

```ts
export class MyComponent implements Component, LifeCycleObserver {
  // ...

  async init() {
    // Contribute bindings via `init`
    const val = await readFromConfig();
    this.app.bind('abc').to(val);

    this.status = 'initialized';
    this.initialized = true;
  }

  async start() {
    this.status = 'started';
  }

  async stop() {
    this.status = 'stopped';
  }
}
```

Please note that components are treated as
[life cycle observers](Life-cycle.md). In addition to `init`, `start` and `stop`
methods are also supported for a component to be notified when the application
is started or stopped.

## Using components

Components can be added to your application using the `app.component()` method.

The following is an example of installing and using a component.

Install the following dependencies:

```sh
npm install --save @loopback/authentication
```

To load the component in your application:

```ts
import {RestApplication} from '@loopback/rest';
import {AuthenticationComponent} from '@loopback/authentication';

const app = new RestApplication();
// Add component to Application, which provides bindings used to resolve
// authenticated requests in a Sequence.
app.component(AuthenticationComponent);
```

## Official components

Here is a list of components officially created and maintained by the LoopBack
team.

### Core components

These components implement the primary LoopBack capabilities.

- [@loopback/authentication](https://github.com/strongloop/loopback-next/tree/master/packages/authentication) -
  A LoopBack component for authentication support
- [@loopback/authorization](https://github.com/strongloop/loopback-next/tree/master/packages/authorization) -
  A LoopBack component for authorization support
- [@loopback/boot](https://github.com/strongloop/loopback-next/tree/master/packages/boot) -
  A collection of Booters for LoopBack 4 Applications
- [@loopback/booter-lb3app](https://github.com/strongloop/loopback-next/tree/master/packages/booter-lb3app) -
  A booter component for LoopBack 3 applications to expose their REST API via
  LoopBack 4
- [@loopback/rest](https://github.com/strongloop/loopback-next/tree/master/packages/rest) -
  Expose controllers as REST endpoints and route REST API requests to controller
  methods
- [@loopback/rest-crud](https://github.com/strongloop/loopback-next/tree/master/packages/rest-crud) -
  REST API controller implementing default CRUD semantics
- [@loopback/rest-explorer](https://github.com/strongloop/loopback-next/tree/master/packages/rest-explorer) -
  LoopBack's API Explorer

### Extensions

These components add additional capabilities to LoopBack.

- [@loopback/apiconnect](https://github.com/strongloop/loopback-next/tree/master/extensions/apiconnect) -
  An extension for integrating with
  [IBM API Connect](https://www.ibm.com/cloud/api-connect)
- [@loopback/authentication-jwt](https://github.com/strongloop/loopback-next/tree/master/extensions/authentication-jwt) -
  Extension for JWT authentication
- [@loopback/authentication-passport](https://github.com/strongloop/loopback-next/tree/master/extensions/authentication-passport) -
  A package creating adapters between the passport module and
  @loopback/authentication
- [@loopback/context-explorer](https://github.com/strongloop/loopback-next/tree/master/extensions/context-explorer) -
  Visualize context hierarchy, bindings, configurations, and dependencies
- [@loopback/cron](https://github.com/strongloop/loopback-next/tree/master/extensions/cron) -
  Schedule tasks using cron-like syntax
- [@loopback/health](https://github.com/strongloop/loopback-next/tree/master/extensions/health) -
  An extension exposes health check related endpoints with LoopBack 4
- [@loopback/logging](https://github.com/strongloop/loopback-next/tree/master/extensions/logging) -
  An extension exposes logging for Winston and Fluentd with LoopBack 4
- [@loopback/metrics](https://github.com/strongloop/loopback-next/tree/master/extensions/metrics) -
  An extension exposes metrics for Prometheus with LoopBack 4
- [@loopback/pooling](https://github.com/strongloop/loopback-next/tree/master/extensions/pooling) -
  Resource pooling service for LoopBack 4
- [@loopback/typeorm](https://github.com/strongloop/loopback-next/tree/master/extensions/typeorm) -
  Adds support for TypeORM in LoopBack

### Community extensions

For a list of components created by community members, refer to
[Community extensions](./Community-extensions.html).

## Creating components

Please refer to [Creating components](Creating-components.md) for more
information.
