---
lang: en
title: 'Extension point and extensions'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Extension-point-and-extensions.html
---

## Extension point/extension pattern

[Extension Point/extension](https://wiki.eclipse.org/FAQ_What_are_extensions_and_extension_points%3F)
is a very powerful design pattern that promotes loose coupling and offers great
extensibility. There are many use cases in LoopBack 4 that fit into design
pattern. For example:

- `@loopback/boot` uses `BootStrapper` that delegates to `Booters` to handle
  different types of artifacts
- `@loopback/rest` uses `RequestBodyParser` that finds the corresponding
  `BodyParsers` to parse request body encoded in different media types
- `@loopback/core` uses `LifeCycleObserver` to observe `start` and `stop` events
  of the application life cycles.

To add a feature to the framework and allow it to be extended, we divide the
responsibility into two roles:

- Extension point: it represents a **common** functionality that the framework
  depends on and interacts with, such as, booting the application, parsing http
  request bodies, and handling life cycle events. Meanwhile, the extension point
  also defines contracts for its extensions to follow so that it can discover
  corresponding extensions and delegate control to them without having to hard
  code such dependencies.

- Extensions: they are implementations of **specific** logic for an extension
  point, such as, a booter for controllers, a body parser for xml, and a life
  cycle observer to load some data when the application is started. Extensions
  must conform to the contracts defined by the extension point.

**NOTE**: Applications can also benefit from the extension point/extensions
pattern by separating common functionality and specific behaviors for the
business logic.

## Helper decorators and functions

To simplify implementations of extension point and extensions pattern on top of
LoopBack 4's [Inversion of Control](Context.md) and
[Dependency Injection](Dependency-injection.md) container, the following helper
decorators and functions are provided to ensure consistency and convention.

- `@extensionPoint`: decorates a class to be an extension point with an optional
  custom name
- `@extensions`: injects a getter function to access extensions to the target
  extension point
- `@extensions.view`: injects a context view to access extensions to the target
  extension point. The view can be listened for context events.
- `@extensions.list`: injects an array of extensions to the target extension
  point. The list is fixed when the injection is done and it does not add or
  remove extensions afterward.
- `extensionFilter`: creates a binding filter function to find extensions for
  the named extension point
- `extensionFor`: creates a binding template function to set the binding to be
  an extension for the named extension point(s). It can accept one or more
  extension point names to contribute to given extension points
- `addExtension`: registers an extension class to the context for the named
  extension point

## Examples

1. Inject a getter function for extensions

   ```ts
   import {Getter} from '@loopback/context';
   import {extensionPoint, extensions} from '@loopback/core';

   @extensionPoint('greeters')
   class GreetingService {
     @extensions()
     public getGreeters: Getter<Greeter[]>;
   }
   ```

2. Inject a context view for extensions

   ```ts
   import {ContextView} from '@loopback/context';
   import {extensionPoint, extensions} from '@loopback/core';

   @extensionPoint('greeters')
   class GreetingService {
     constructor(
       @extensions.view()
       public readonly greetersView: ContextView<Greeter>,
     ) {
       // ...
     }
   }
   ```

3. Inject an array of resolved extensions

   ```ts
   import {extensionPoint, extensions} from '@loopback/core';

   @extensionPoint('greeters')
   class GreetingService {
     @extensions.list()
     public greeters: Greeter[];
   }
   ```

More usage of these helper decorators and functions are illustrated in the
`greeter-extension` tutorial.

## Tutorial

The
[greeter-extension example](https://github.com/strongloop/loopback-next/tree/master/examples/greeter-extension)
provides a walk-through on how to implement the extension point/extension
pattern using LoopBack 4's [Context](Context.md) and
[Dependency injection](Dependency-injection.md) container.
