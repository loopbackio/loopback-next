---
lang: en
title: 'Configuring Applications'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Concepts
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Configuring-applications.html
---

## Making your own application class

By making your own application class, you can perform several additional tasks
as a part of your setup:

- Pass the configuration into the base class constructor
- Perform asynchronous startup functions before starting the application
- Perform graceful cleanup functions when the application stops

{% include code-caption.html content="src/widget.application.ts" %}

```ts
import {Application} from '@loopback/core';
import {RestComponent} from '@loopback/rest';
import {UserController, ShoppingCartController} from './controllers';

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
    app.controller(UserController);
    app.controller(ShoppingCartController);
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

Let's see how these configurations work below.

### Manual binding configuration

Binding is the most commonly-demonstrated form of application configuration
throughout our examples. Binding is the recommended method for setting up your
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
[`Application`](https://loopback.io/doc/en/lb4/apidocs.core.application.html)
API docs page.

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
[Using Components](Component.md#using-components).

#### Controllers

```ts
app.controller(FooController);
app.controller(BarController);
```

Much like the component function, the `controller` function allows binding of
[Controllers](Controller.md) to the `Application` context.

#### Servers

```ts
app.server(RestServer);
app.servers([MyServer, GrpcServer]);
```

The `server` function is much like the previous functions, but bulk bindings are
possible with [Servers](Server.md) through the function `servers`.

```ts
const app = new Application();
app.server(RestServer, 'public'); // {'public': RestServer}
app.server(RestServer, 'private'); // {'private': RestServer}
```

In the above example, the two server instances would be bound to the Application
context under the keys `servers.public` and `servers.private`, respectively.

The above examples of binding demonstrate manual binding where LoopBack does not
automatically register the above artifacts on your behalf. Alternatively,
LoopBack can automatically register artifacts for you. Let's see how this is
done with [DataSources](DataSource.md) and [Repositories](Repository.md) below.

#### DataSources

### Automatic binding configuration

Alternative to manually binding artifacts in your application LoopBack 4 comes
with an automatic approach to binding artifacts like Controllers, DataSources,
Models and Repositories. Using a
[Booter class](https://loopback.io/doc/en/lb4/Booting-an-Application.html#booters)
LoopBack automatically discovers the above artifacts, as per the folder
structure illustrated in the table below:

| Artifact     | Directory      | File extension   |
| ------------ | -------------- | ---------------- |
| `Controller` | `controllers`  | `.controller.ts` |
| `DataSource` | `datasources`  | `.datasource.ts` |
| `Repository` | `repositories` | `.repository.ts` |
| `Model`      | `models`       | `.model.ts`      |

{% include tip.html content="
Automatic binding configuration is by default supported when using the [Command-line interface](Command-line-interface.md) tools
" %}

### Constructor configuration

The `Application` class constructor also accepts an
[`ApplicationConfig`](https://loopback.io/doc/en/lb4/apidocs.core.applicationconfig.html)
object which contains component-level configurations such as
[`RestServerConfig`](https://loopback.io/doc/en/lb4/apidocs.rest.restserverconfig.html).
It will automatically create bindings for these configurations and later be
injected through dependency injections. Visit
[Dependency Injection](Dependency-injection.md) for more information.

{% include note.html content="
Binding configuration such as component binding,
provider binding, or binding scopes are not possible with the constructor-based
configuration approach.
" %}

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

## Further Reading

- [Booting an Application](Booting-an-Application.md)
