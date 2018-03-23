---
lang: en
title: 'Application'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Application.html
summary:
---

## What is an Application?

In LoopBack 4, the
[`Application`](http://apidocs.strongloop.com/@loopback%2fcore/#Application)
class is the central class for setting up all of your module's components,
controllers, servers and bindings. The `Application` class extends
[Context](Context.md), and provides the controls for starting and stopping
itself and its associated servers.

When using LoopBack 4, we strongly encourage you to create your own subclass of
`Application` to better organize your configuration and setup.

## Making your own application class

By making your own application class, you can perform several additional tasks
as a part of your setup:

- Pass configuration into the base class constructor
- Perform some asynchronous wireup before application start
- Perform some graceful cleanup on application stop

{% include code-caption.html content="src/widget-application.ts" %}

```ts
import {Application} from '@loopback/core';
import {RestComponent, RestServer} from '@loopback/rest';
import {SamoflangeController, DoohickeyController} from './controllers';

export class WidgetApplication extends Application {
  constructor() {
    // This is where you would pass configuration to the base constructor
    // (as well as handle your own!)
    super({
      rest: {
        port: 8080,
      },
    });

    const app = this; // For clarity.
    // You can bind to the Application-level context here.
    // app.bind('foo').to(bar);
    app.component(RestComponent);
    app.controller(SamoflangeController);
    app.controller(DoohickeyController);
  }

  async stop() {
    // This is where you would do whatever is necessary before stopping your
    // app (graceful closing of connections, flushing buffers, etc)
    console.log('Widget application is shutting down...');
    // The superclass stop method will call stop on all servers that are
    // bound to the application.
    await super.stop();
  }
}
```

## Configuring your application

Your application can be configured with constructor arguments, bindings, or a
combination of both.

### Binding configuration

Binding is the most commonly-demonstrated form of application configuration
throughout our examples, and is the recommended method for setting up your
application.

In addition to the binding functions provided by [Context](Context.md), the
`Application` class also provides some sugar functions for commonly used
bindings, like `component`, `server` and `controller`:

```ts
export class MyApplication extends Application {
  constructor() {
    super();
    this.component(MagicSuite);
    this.server(RestServer, 'public');
    this.server(RestServer, 'private');

    this.controller(FooController);
    this.controller(BarController);
    this.controller(BazController);
  }
}
```

You can find a complete list of these functions on the
[`Application`](http://apidocs.loopback.io/@loopback%2fcore/#Application) API
docs page.

Additionally, you can use more advanced forms of binding to fine-tune your
application's configuration:

```ts
export class MyApplication extends Application {
  constructor() {
    super();
    this.server(RestServer);
    this.controller(FooController);
    this.bind('fooCorp.logger').toProvider(LogProvider);
    this.bind('repositories.widget')
      .toClass(WidgetRepository)
      .inScope(BindingScope.SINGLETON);
  }
}
```

In the above example:

- injection calls for `fooCorp.logger` will be handled by the `LogProvider`
  class.
- injection calls for `repositories.widget` will be handled by a singleton
  instance of the `WidgetRepository` class.

#### Components

```ts
app.component(MyComponent);
app.component(RestComponent);
```

The `component` function allows binding of component constructors within your
`Application` instance's context.

For more information on how to make use of components, see
[Using Components](Using-components.md).

#### Controllers

```ts
app.controller(FooController);
app.controller(BarController);
```

Much like the component function, the `controller` function allows binding of
[Controllers](Controllers.md) to the `Application` context.

#### Servers

```ts
app.server(RestServer);
app.servers([MyServer, GrpcServer]);
```

The `server` function is much like the previous functions, but with
[Servers](server.md) bulk bindings are possible through the function `servers`.

```ts
const app = new Application();
app.server(RestServer, 'public'); // {'public': RestServer}
app.server(RestServer, 'private'); // {'private': RestServer}
```

In the above example, the two server instances would be bound to the Application
context under the keys `servers.public`, and `servers.private` respectively.

### Constructor configuration

The `Application` class constructor also accepts an
[`ApplicationConfig`](http://apidocs.strongloop.com/@loopback%2fcore/#ApplicationConfig)
object which contains component-level configurations such as
[`RestServerConfig`](http://apidocs.strongloop.com/@loopback%2frest/#RestServerConfig).
It will automatically create bindings for these configurations and later be
injected through dependency injections. Visit
[Dependency Injection](Dependency-injection.md) for more details.

{% include note.html content=" Binding configuration such as component binding,
provider binding, or binding scopes are not possible with the constructor-based
configuration approach. " %}

```ts
export class MyApplication extends RestApplication {
  constructor() {
    super({
      rest: {
        port: 4000,
        host: 'my-host',
      },
    });
  }
}
```

## Tips for application setup

Here are some tips to help avoid common pitfalls and mistakes.

### Extend from `RestApplication` when using `RestServer`

If you want to use `RestServer` from our `@loopback/rest` package, we recommend
you extend `RestApplication` in your app instead of manually binding
`RestServer` or `RestComponent`. `RestApplication` already uses `RestComponent`
and makes useful functions in `RestServer` like `handler()` available at the app
level. This means you can call these `RestServer` functions to do all of your
server-level setups in the app constructor without having to explicitly retrieve
an instance of your server.

### Use unique bindings

Use binding names that are prefixed with a unique string that does not overlap
with loopback's bindings. As an example, if your application is built for your
employer FooCorp, you can prefix your bindings with `fooCorp`.

```ts
// This is unlikely to conflict with keys used by other component developers
// or within loopback itself!
app.bind('fooCorp.widgetServer.config').to(widgetServerConfig);
```

### Avoid use of `getSync`

We provide the
[`getSync`](http://apidocs.loopback.io/@loopback%2fcontext/#getSync) function
for scenarios where you cannot asynchronously retrieve your bindings, such as in
constructor bodies.

However, the number of scenarios in which you must do this are limited, and you
should avoid potential race conditions and retrieve your bindings asynchronously
using the [`get`](http://apidocs.loopback.io/@loopback%2fcontext/#get) function
whenever possible.

### Use caution with singleton binding scopes

By default, bindings for controllers will instantiate a new instance whenever
they are injected or retrieved from their binding. Your application should only
set singleton binding scopes on controllers when it makes sense to do so.
