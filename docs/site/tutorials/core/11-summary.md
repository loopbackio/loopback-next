# Summary

https://12factor.net/

> I. Codebase One codebase tracked in revision control, many deploys

We're using github.

> II. Dependencies Explicitly declare and isolate dependencies

We use dependency injection.

> III. Config Store config in the environment

Context-based configuration and pluggable configuration resolver.

> IV. Backing services Treat backing services as attached resources

Services/DataSources/...

> V. Build, release, run Strictly separate build and run stages

npm scripts

> VI. Processes Execute the app as one or more stateless processes

Stateless Docker container

> VII. Port binding Export services via port binding

HTTP/HTTPS server via configuration

> VIII. Concurrency Scale out via the process model

> IX. Disposability Maximize robustness with fast startup and graceful shutdown

Life cycle events and observers

> X. Dev/prod parity Keep development, staging, and production as similar as
> possible

> XI. Logs Treat logs as event streams

> XII. Admin processes Run admin/management tasks as one-off processes

---

## Series

1. Universal registration and resolution for all artifacts

(Introduce the idea of `Context` and `Binding`)

- registry as the knowledge base
- consistent apis to retrieve or search artifacts
- supply values for registered entries

2. Dependency injection

(Beyond locating artifacts proactively in code, push dependencies to the target
inversely)

- By key: `@inject(key)`
- By filter: `@inject(filter)`
- Defer resolution: `@inject.getter`
- Listen on changes: `@inject.view`

- Create your own `injector`

3. Configuration

(An accompanying facility for bound artifacts to provide configurations)

- ctx.configure
- ctx.gtConfig
- `@config.*`

- Create your own configuration resolver

4. Make your module or application extensible

- extension point/extension pattern

5. Aspect-oriented programming

- observers and interceptors

## Deep dive

The magic `Context` - Inversion of Control (IoC) container and Dependency
Injection (DI) framework

- Context

  - A registry of bindings
  - A hierarchy of contexts
  - Add/remove entries
  - Find entries
    - By key
    - By tags
  - Observe entries
  - Resolve bound value(s)

- Binding

  - An entry in the registry
  - Key/tags/scope
  - How is a value fulfilled
    - Constant (to)
    - A factory function (toDynamicValue)
    - A class to instantiate (toClass)
    - A class to provide the value (toProvider)
    - An alias to another binding
  - Configure a binding
    - Fluent APIs
    - BindingTemplate functional programming

- Dependency injection

  - Sync vs. Async (ValueOrPromise)
  - Only applicable to classes and their members
  - Constructor dependency injection/property dependency injection/method
    parameter dependency injection
  - Decorators
    - `@inject.*`
    - Create your own decorator for injection
  - Create your own `resolve`
  - Detect circular dependencies

- Decorator

- Component

  - Contribution of bindings

- Interceptors
- Observers

* (Deep dive - the patterns) Extensibility
  - Extension point/extension
  - Discovering and ordering
  - Chain of handling
