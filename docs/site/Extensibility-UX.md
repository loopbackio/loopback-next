---
lang: en
title: 'Extensibility UX'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Extensibility-UX.html
summary:
---

## Overview

This document is to describe user experience for `extension` and `application`
developers to extend LoopBack 4 in various ways categorized as follows.

- Extend or customize portions of the framework functionality
- Override the default behavior of a component of the framework
- Contribute artifacts to provide application logic to be invoked by the
  framework

https://github.com/strongloop/loopback-next/issues/1034

https://github.com/strongloop/loopback-next/issues/953

List of issues in the current design of Extensions:

- Writing an extension class requires a lot of hand-written glue. Developers
  have to explicitly list all controllers, bindings, etc. they want to add to
  the app. We should have a conventional bootstrapper that can scan filesystem
  and discover artifacts to add to the app automatically. Ideally, most of the
  conventions should be same for applications and extensions, so that LoopBack
  users have only one set of conventions to learn, and the bootstrapper package
  has only one set of conventions to implement.

(This has been partially implemented in `@loopback/boot`).

- Adding support for new type of artifacts that can be contributed by extensions
  requires changes in several places. For example, we already have API for
  binding classes (app.bind('foo').toClass(Foo)), but components cannot leverage
  it until app.component() is updated to support it as well.

- Even though it's easy for a component to contribute Providers for DI, the
  extension cannot control binding settings like scope (SINGLETON), tags, etc.

- The ability to expose an extension point to allow customization of a service
  and fall back to a default implementation. For example, a user management
  component by default uses bcrypt for password hashing but it should allow an
  optional external binding for the hashing function.

- The ability to organize artifacts as extension points/extensions, for example,
  bootstrapper -> booters, authenticator -> strategies, rest -> servers, even
  app -> components. The extension point should be able to depend on a list or
  map of extension instances for delegation. Each extension point and extension
  should be able to receive corresponding configurations.

- The ability to maintain isolated and connected contexts for an app, a
  component, or an extension point.

## Use cases

LoopBack 4 creates abstractions of various types of artifacts to represent
different kinds of building blocks for developing open apis and microservices.
The framework allows developers to contribute configuration and/or code for
specific concerns so that it can perform common tasks on behalf of the
application.

Let's first look at some of the artifacts that are interesting to application
and extension developers.

- Artifacts typically contributed by application developers:

  - controllers: Organizes business logic to handle API requests/responses
  - repositories: Provides persistent data access for models
  - data sources: Configures backend connectivity
  - models: Defines schema and mapping for data objects

- Artifacts typically contributed by extension developers

  - decorators: Decorates TypeScript classes/members to supply metadata and
    customize behaviors
  - mixins: Extends APIs
  - booters: Discovers and loads new forms of artifacts
  - servers: Handling inbound transports/protocols
  - connectors: Provides interactions with backend systems (databases/services)
  - actions: Performs tasks within the request/response processing sequence
  - types: Provides data typing
  - serializers/deserializers: Serialize/deserialize data from/to transport
    level messages
  - interceptors/observers: Intercepts or observes invocations
  - validators: Validates input parameters or model properties
  - authentication strategies: Authenticates API requests
  - authorization providers: Authorize API requests
  - generators: Generates artifacts
  - utilities: Utility functions

The need to support extensible types of constructs creates challenges for
LoopBack 4 to manage artifacts that are possibly unknown the framework itself.

To provide a consistent way to register and organize artifacts to facilitate
access and resolution, LoopBack 4 has introduced `@loopback/context` module as
an implementation of Inversion of Control and Dependency Injection.

1. `Context` serves as the universal registry for all types of artifacts. It
   provides APIs to register, find, and resolve artifacts. Multiple instances of
   `Context` can be created to form a hierarchy to manage artifacts in different
   scopes. For example:

```ts
const appCtx = new Context('app');
const reqCtx = new Context(appCtx, 'req');
```

2. `Binding` represents an entry in a `Context`, which associates a key
   (address) with an artifact backed by a constant value, a factory function, a
   class or a provider class. Each binding can be tagged for grouping and
   filtering.

```ts
appCtx
  .bind('controllers.CustomerController')
  .toClass(CustomerController)
  .tag('controller');
appCtx
  .bind('repositories.CustomerRepository')
  .toClass(CustomerRepository)
  .tag('repository');
```

3. Resolution of artifacts is based on binding keys, tags and artifact
   dependencies. It can be performed synchronously or asynchronously depending
   on how artifacts are instantiated and dependencies are fulfilled.

```ts
const customerController = await appCtx.get<CustomerController>(
  'controllers.CustomerController',
);
```

4. `@inject` and its variants can be used to decorate TypeScript classes and
   their members to express dependencies for injection.

```ts
export class CustomerController {
  constructor(
    @inject('repositories.CustomerRepository')
    protected customerRepository: CustomerRepository,
  ) {}
}
```

- Promote decoupling with extension point/extension pattern
  - boostrapper -> booters
  - authentication -> strategies
  - authorization -> schemes
  - logging -> loggers
  - validation -> validators
  - serialization/deserializtion -> serializers/deserializers
  - password hashing -> hashers
  - transport -> servers

See https://github.com/strongloop/loopback-next/pull/657

## Scenarios

### Authentication with pluggable strategies

### Logging with configurable log level and loggers

### Add a new forms of API

### Use different databases for testing and production

### Use different hashing algorithms for testing and production

### Interceptors

- Inbound Apply interceptors for all http requests/responses

```
context.bind('http.interceptors.Logging').tag({interceptor: 'http'});
```

Apply interceptors for a given http endpoint (protocol/host/port) Apply
interceptors for REST routes Apply interceptors for controllers Apply
interceptors for a given controller Apply interceptors for a given controller
method

- Outbound Apply interceptors for repositories/service proxies Apply
  interceptors for a given repository/service proxy Apply interceptors for a
  given repository/service proxy method Apply interceptors for a given connector
  Apply interceptors for all outbound http requests/responses

### Observers

- Observe events emitted

### Narratives

#### Authentication

- A way to express authentication requirements

  - If authentication is required
  - What strategy to use

- Where to trigger the authentication

- How to contribute a new authentication strategy

  - What contract to implement
  - How to register the new strategy

- How does the authentication component knows all strategy providers
- How to configure the authentication component

## Contribute extensions to an existing artifact type

- Add a JWT token authentication strategy
- Add a booter for model definitions

## Create a new extension point

- Add an authorization extension point
- Add a HTTP request/response message reader/writer extension point

## Associate extensions with an extension point

- Explicit registration by API

```ts
application.controller(CustomerController);
```

- Bind to a known namespace for the artifact type

```ts
application.bind(`controllers.CustomerController`).toClass(CustomerController);
```

- By directory/file convention for discovery/boot

Export `CustomerController` class from `controllers/customer.controller.ts`.

- Extra metadata to help discovery/registration

```ts
@bind({tags: {type: 'controller', name: 'customer-controller'}})
export class CustomerController {}
```

See https://github.com/strongloop/loopback-next/pull/992

- Bind the extension under the key namespace of the extension point. For
  example:

```ts
context.bind(`authentication.strategies.LDAPStrategy`).toClass(LDAPStrategy);
```

- Tag an extension binding with `{extensionPoint: 'authentication.strategies'}`.
  For example:

```ts
context
  .bind(`authentication.strategies.LDAPStrategy`)
  .toClass(LDAPStrategy)
  .tag({extensionPoint: 'authentication.strategies'});
```

See https://github.com/strongloop/loopback-next/pull/1262

- Use an API

```ts
application.extension('authentication.strategies', LDAPStrategy);
```

## Configure bindings

https://github.com/strongloop/loopback-next/pull/983

Add context.configure() to configure bindings

```ts
context.configure('controllers.CustomerController').to({db: 'mysql'});
```

Add context.getConfig/getConfigSync() to look up config for a binding

```ts
const config = await context.getConfig('controllers.CustomerController');
```

Add @injection.config() to receive injection of config

```ts
export class CustomerController {
  @inject.config()
  private config: CustomerControllerConfig;
}
```

## Access extensions from an extension point

See https://github.com/strongloop/loopback-next/pull/2122

- Look up `Context` with tags
- Dependency injection via `@inject.extensions`

## Typical delegation pattern from extension point to extension(s)

- Visitor: pass control to all registered extensions
- Delegator: use the metadata to decide which extension to use, for example,
  find an authentication strategy provider based on the strategy name
- Select: select the utility based on the running environment, for example, sha1
  for testing while bcrypt for production
- Chain of responsibilities
- Interceptors
- Subscribers/publishers

## Bundle extension points/extensions

Package extension points and/or extensions as a npm module and export them using
component bindings.

log-component.ts

```ts
export class LogComponent extends Component {
  // ...
}
```

See https://github.com/strongloop/loopback-next/pull/929

## Life cycles

See https://github.com/strongloop/loopback-next/pull/1928

- preStart
- start
- postStart
- preStop
- stop
- postStop

## Layers of foundation for extensibility

- IoC/DI
- Extension point/extension
