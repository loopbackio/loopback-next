---
lang: en
title: 'Services'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Services.html
---

## Overview

We use the `service` concept in LoopBack 4 to refer to an object with methods to
perform local or remote operations. Such objects are resolved from
[bindings](Binding.md) within a [LoopBack 4 context](Context.md).

We support three types of services:

- proxy: A service proxy for remote REST/SOAP/gRPC APIs
- class: A TypeScript class that can be bound to the application context
- provider: A TypeScript class that implements `Provider` interface and can be
  bound to the application context

For remote services (type=proxy), there should be at least one valid _(REST,
SOAP, or gRPC)_ data source created already in the `src/datasources` directory.

## Generate services using CLI

The `lb4 service` command can generate code for local and remote services.

See [Service Generator](Service-generator.md) for more details.

## Register services with the application

Services added to `src/services` are automatically discovered and registered
when the application is booted.

To register a service by code, use
[application.service()](https://loopback.io/doc/en/lb4/apidocs.core.application.service.html).
For example,

- Bind a service class or provider

  ```ts
  // For a class, the interface is default to the class itself
  const binding = app.service(MyService);
  ```

  ```ts
  // A custom name can be specified when the service is registered
  const binding = app.service(MyService, 'my-service');
  ```

- Bind a service class or provider with an interface identified by a string

  ```ts
  // Register a service and mark the interface as `MyService`
  const binding = app.service(MyService, {interface: 'MyService'});
  ```

  ```ts
  // Register a service provider and mark the interface as `MyService`
  const binding = app.service(MyServiceProvider, {interface: 'MyService'});
  ```

  **NOTE**: _The `app.service()` inspects the class to determine if it's a
  provider by the existence of a `value` prototype method. A provider class is
  bound using `app.toProvider()`. Otherwise `app.toClass()` is used._

- Bind a service with an interface identified by a symbol

  ```ts
  // Define a symbol as the id for a service interface
  const MyServiceInterface = Symbol('MyService');
  const binding = app.service(MyService, {interface: MyServiceInterface});
  ```

## Inject service instances

A `@service` decorator is provided to declare injection of a service instance by
interface.

A class can be used as the interface to identify the service:

```ts
class MyController {
  constructor(@service(MyService) public myService: MyService) {}
}
```

The service class can be inferred from the design type of the target if present.
In the example below, the interface is `MyService`.

```ts
class MyController {
  constructor(@service() public myService: MyService) {}
}
```

If the service is modeled as a TypeScript interface, we need to use a string or
symbol to represent the interface as TypeScript interfaces cannot be reflected
at runtime.

```ts
const MyServiceInterface = 'MyService';
class MyController {
  constructor(@service(MyServiceInterface) public myService: MyService) {}
}
```

```ts
const MyServiceInterface = Symbol('MyService');
class MyController {
  constructor(@service(MyServiceInterface) public myService: MyService) {}
}
```

See [Service Decorator](decorators/Decorators_service.md) for more details.
