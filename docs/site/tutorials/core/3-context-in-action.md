---
lang: en
title: 'Context in action'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/core-tutorial-part3.html
---

In the traditional modular design, we often declare various artifacts as
classes/interfaces in separate files and use `export/import` to reference from
each other across modules.

For a large-scale application or framework, many kinds of artifacts and many
instances of the same kind are added to the project. In many cases, there are
also dependencies among them. It is desirable to have a consistent way to manage
such artifacts so that they can be registered, configured, accessed, and
resolved while respecting the dependency requirements.

[Inversion of Control (IoC)](https://en.wikipedia.org/wiki/Inversion_of_control)
is a proven design pattern to solve similar problems. Together with
[Dependency Injection (DI)](https://en.wikipedia.org/wiki/Dependency_injection),
artifacts become much more tangible and visible.

In LoopBack 4, we implemented such capabilities in the `@loopback/context`
module. The hierarchy of contexts becomes the universal knowledge base for the
whole application to promote visibility, extensibility, and composability.

Let's walk through some code snippets to illustrate how artifacts are managed
with `@loopback/context`.

## Registering artifacts

To register artifacts, we first create an instance of `Context` and use `bind`
to add artifacts to the registry as bindings.

```ts
import {Context} from '@loopback/context';
import {GreetingController} from './controllers';
import {CACHING_SERVICE, GREETING_SERVICE} from './keys';
import {CachingService} from './caching-service';
import {GreetingService} from './greeting-service';
const ctx = new Context();
ctx.bind('controllers.GreetingController').toClass(GreetingController);
ctx.bind(CACHING_SERVICE).toClass(CachingService);
ctx.bind(GREETING_SERVICE).toClass(GreetingService);
```

```ts
export class GreetingApplication extends BootMixin(RestApplication) {
  constructor(config: ApplicationConfig = {}) {
    super(config);
    this.projectRoot = __dirname;
    this.add(createBindingFromClass(CachingService, {key: CACHING_SERVICE}));
    this.add(createBindingFromClass(CachingInterceptor));
    this.component(GreetingComponent);
  }
  // ...
}
```

## Providing values for artifacts

Here are different ways to supply the value for the artifacts in LoopBack.
Artifacts can be services, repositories, configuration, etc.

1. As a constant value.

   The constant value can be a string, number or any other types.

2. To be created by a factory function.

   For example, a function to get the current time.

3. To be instantiated from a class.

   A class can be a service, controller or other LoopBack artifacts.

4. To be created from a provider class.

   Since plain functions do not accept injections, you can create a wrapper
   class that has the ability to accept injection. For example, you can create a
   provider class that recevies injection of a HTTP request.

5. As an alias to another binding

   This is a convenient way to allow a binding pointing to another one.

The
[binding-types.ts](https://github.com/strongloop/loopback-next/blob/master/examples/context/src/binding-types.ts)
in `example-context` example shows various ways to provide values for a binding.

For details, see the
[Binding documentation page](https://loopback.io/doc/en/lb4/Binding.html).

## Resolving artifacts by key

The
[find-bindings.ts](https://github.com/strongloop/loopback-next/blob/master/examples/context/src/find-bindings.ts)
in the `example-context` example shows different flavors of finding bindings in
a context

## Discovering artifacts by filter

For the cases that we don't know the binding keys ahead of time, we can match
the bindings by using the filter function.

For example, controllers can be used for REST APIs, GraphQL APIs, web sockets,
etc. We can discover all the controllers that has the OpenAPI decorators by
having a filter function to differentiate different types of controllers.

## Binding scopes

There are three binding scopes:

1. Transient - a new instance of binding is created for each request.
2. Singleton - there is only a single instance of the binding.
3. Context - for a given context in the hierarchy, there is only a single
   instance for a given binding key.

For details, see
https://loopback.io/doc/en/lb4/Binding.html#configure-the-scope.

## Watching artifacts

The context view gives us control when a binding is being added or moreved. This
also allows the support of dynamic extension points. For the
[greeting-app example](https://github.com/strongloop/loopback-next/tree/master/examples/greeting-app),
after the application has started, more greeters can be added, and there is no
need to add all the greeters up front.

See the
[Context documentation page](https://loopback.io/doc/en/lb4/Context.html#context-observers)
and
[example](https://github.com/strongloop/loopback-next/blob/master/examples/context/src/context-observation.ts)
for more details.

## Contributing multiple artifacts via components

[Components](https://loopback.io/doc/en/lb4/Components.html) can be considered
as a collection of binding added to the context. For example, for an
authentication component, an authentication stategy and an authentication action
can be added to the component.

See
https://github.com/strongloop/loopback-next/blob/master/examples/greeter-extension/src/component.ts
as an example.

```ts
/**
 * Define a component to register the greeter extension point and built-in
 * extensions
 */
export class GreetingComponent implements Component {
  bindings = [
    createBindingFromClass(GreetingService, {
      key: GREETING_SERVICE,
    }),
    createBindingFromClass(EnglishGreeter),
    createBindingFromClass(ChineseGreeter),
  ];
}
```

---

Previous: [Part 2 - Architectural challenges](./2-architecture.md)

Next: [Part 4 - Dependency injection](./4-dependency-injection.md)
