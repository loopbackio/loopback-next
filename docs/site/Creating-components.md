---
lang: en
title: 'Creating components'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Creating-components.html
summary:
---


As explained in [Using Components](Using-components.md), a typical LoopBack component is an npm package exporting a Component class.

```js
import MyController from './controllers/my-controller';
import MyValueProvider from './providers/my-value-provider';

export class MyComponent {
  constructor() {
    this.controllers = [MyController];
    this.providers = {
      'my.value': MyValueProvider
    };
  }
}
```

When a component is mounted to an application, a new instance of the component class is created and then:
 - Each Controller class is registered via `app.controller()`,
 - Each Provider is bound to its key in `providers` object.

The example `MyComponent` above will add `MyController` to application's API and create a new binding `my.value` that will be resolved using `MyValueProvider`.

## Providers

Providers enable components to export values that can be used by the target application or other components. The `Provider`  class provides a `value()` function called by [Context](Context.md) when another entity requests a value to be injected.

```js
import {Provider} from '@loopback/context';

export class MyValueProvider {
  value() {
    return 'Hello world';
  }
}
```

### Specifying binding key

Notice that the provider class itself does not specify any binding key, the key is assigned by the component class.

```js
import MyValueProvider from './providers/my-value-provider';

export class MyComponent {
  constructor() {
    this.providers = {
      'my-component.my-value': MyValueProvider
    };
  }
}
```

### Accessing values from Providers

Applications can use `@inject` decorators to access the value of an exported Provider.
If you’re not familiar with decorators in TypeScript, see [Key Concepts: Decorators](Decorators.md)

```js
const app = new Application();
app.component(MyComponent);

class MyController {
  constructor(@inject('my-component.my-value') greeting) {
    // LoopBack sets greeting to 'Hello World' when creating a controller instance
    this.greeting = greeting;
  }

  @get('/greet')
  greet() {
    return this.greeting;
  }
}
```

{% include note.html title="A note on binding names" content="To avoid name conflicts, add a unique prefix to your binding key (for example, `my-component.` in the example above). See [Reserved binding keys](Reserved-binding-keys.md) for the list of keys reserved for the framework use.
" %}

### Asynchronous providers

Provider's `value()` method can be asynchronous too:

```js
const request = require('request-promise-native');
const weatherUrl =
  'http://samples.openweathermap.org/data/2.5/weather?appid=b1b15e88fa797225412429c1c50c122a1'

export class CurrentTemperatureProvider {
  async value() {
    const data = await(request(`${weatherUrl}&q=Prague,CZ`, {json:true});
    return data.main.temp;
  }
}
```

In this case, LoopBack will wait until the promise returned by `value()` is resolved, and use the resolved value for dependency injection.

### Working with HTTP request/response

In some cases, the Provider may depend on other parts of LoopBack; for example the current `request` object. The Provider's constructor should list such dependencies annotated with `@inject` keyword, so that LoopBack runtime can resolve them automatically.

```js
const uuid = require('uuid/v4');

class CorrelationIdProvider {
  constructor(@inject('http.request') request) {
    this.request = request;
  }

  value() {
    return this.request.headers['X-Correlation-Id'] || uuid();
  }
}
```

## Modifying request handling logic

A frequent use case for components is to modify the way requests are handled. For example, the authentication component needs to verify user credentials before the actual handler can be invoked; or a logger component needs to record start time and write a log entry when the request has been handled.

The idiomatic solution has two parts:

 1. The component should define and bind a new [Sequence action](Sequence.md#actions), for example `authentication.actions.authenticate`:

    ```js
    class AuthenticationComponent {
      constructor() {
        this.providers = {
          'authentication.actions.authenticate': AuthenticateActionProvider
        };
      }
    }
    ```

    A sequence action is typically implemented as an `action()` method in the provider.

    ```js
    class AuthenticateActionProvider {
      // Provider interface
      value() {
        return request => this.action(request);
      }

      // The sequence action
      action(request) {
        // authenticate the user
      }
    }
    ```

    It may be tempting to put action implementation directly inside the anonymous arrow function returned by provider's `value()` method. We consider that as a bad practice though, because when an error occurs, the stack trace will contain only an anonymous function that makes it more difficult to link the entry with the sequence action.


 2. The application should use a custom `Sequence` class which calls this new sequence action in an appropriate place.

    ```js
    class AppSequence implements SequenceHandler {
      constructor(
        @inject('sequence.actions.findRoute') findRoute,
        @inject('sequence.actions.invokeMethod') invoke,
        @inject('sequence.actions.send') send: Send,
        @inject('sequence.actions.reject') reject: Reject,
        // Inject the new action here:
        @inject('authentication.actions.authenticate') authenticate
      ) {
        this.findRoute = findRoute;
        this.invoke = invoke;
        this.send = send;
        this.reject = reject;
        this.authenticate = authenticate;
      }

      async handle(req: ParsedRequest, res: ServerResponse) {
        try {
          const route = this.findRoute(req);

          // Invoke the new action:
          const user = await this.authenticate(req);

          const args = await parseOperationArgs(req, route);
          const result = await this.invoke(route, args);
          this.send(res, result);
        } catch (err) {
          this.reject(res, req, err);
        }
      }
    }
    ```

### Accessing Elements contributed by other Sequence Actions

When writing a custom sequence action, you need to access Elements contributed by other actions run in the sequence. For example, `authenticate()` action needs information about the invoked route to decide whether and how to authenticate the request.

Because all Actions are resolved before the Sequence `handle` function is run, Elements contributed by Actions are not available for injection yet. To solve this problem, use `@inject.getter` decorator to obtain a getter function instead of the actual value. This allows you to defer resolution of your dependency only until the sequence action contributing this value has already finished.

```js
export class AuthenticationProvider {
  constructor(
    @inject.getter(BindingKeys.Authentication.STRATEGY)
    readonly getStrategy
  ) {
    this.getStrategy = getStrategy;
  }

  value() {
    return request => this.action(request);
  }

  async action(request) {
    const strategy = await getStrategy();
    // ...
  }
}
```


### Contributing Elements from Sequence Actions

Use `@inject.setter` decorator to obtain a setter function that can be used to contribute new Elements to the request context.

```js
export class AuthenticationProvider {
  constructor(
    @inject.getter(BindingKeys.Authentication.STRATEGY)
    readonly getStrategy,
    @inject.setter(BindingKeys.Authentication.CURRENT_USER)
    readonly setCurrentUser,
  ) {
    this.getStrategy = getStrategy;
    this.setCurrentUser = setCurrentUser;
  }

  value() {
    return request => this.action(request);
  }

  async action(request) {
    const strategy = await getStrategy();
    const user = // ... authenticate
    setCurrentUser(user);
    return user;
  }
}
```

## Extends Application with Mixin

When binding a component to an app, you may want to extend the app with the component's
properties and methods by using mixins.

An example of how a mixin leverages a component is `RepositoryMixin`.
Suppose an app has multiple components with repositories bound to each of them.
You can use function `RepositoryMixin()` to mount those repositories to application level context.

The following snippet is an abbreviated function
[`RepositoryMixin`](https://github.com/strongloop/loopback-next/blob/master/packages/repository/src/repository-mixin.ts):

{% include code-caption.html content="mixins/src/repository-mixin.ts" %}
```js
export function RepositoryMixin<T extends Class<any>>(superClass: T) {
  return class extends superClass {
    constructor(...args: any[]) {
      super(...args);
    }
  }

  /**
     * Add a component to this application. Also mounts
     * all the components' repositories.
     */
  public component(component: Class<any>) {
    super.component(component);
    this.mountComponentRepository(component);
  }

  mountComponentRepository(component: Class<any>) {
    const componentKey = `components.${component.name}`;
    const compInstance = this.getSync(componentKey);

    // register a component's repositories in the app
    if (compInstance.repositories) {
      for (const repo of compInstance.repositories) {
        this.repository(repo);
      }
    }
  }
}
```

Then you can extend the app with repositories in a component:

{% include code-caption.html content="index.ts" %}

```js
import {RepositoryMixin} from 'mixins/src/repository-mixin';
import {Application} from '@loopback/core';
import {FooComponent} from 'components/src/Foo';

class AppWithRepoMixin extends RepositoryMixin(Application) {};
let app = new AppWithRepoMixin();
app.component(FooComponent);

// `app.find` returns all repositories in FooComponent
app.find('repositories.*');
```

## Configuring components

More often than not, the component may want to offer different value providers depending on the configuration. For example, a component providing an email API may offer different transports (stub, SMTP, and so on).

Components should use constructor-level [Dependency Injection](Context.md#dependency-injection) to receive the configuration from the application.

```js
class EmailComponent {
  constructor(@inject('config#components.email') config) {
    this.config = config;
    this.providers = {
      'sendEmail': config.transport == 'stub' ?
        StubTransportProvider :
        SmtpTransportProvider,
    };
  }
}
```

## Creating your own servers

LoopBack 4 has the concept of a Server, which you can use to create your own
implementations of REST, SOAP, gRPC, MQTT and more. For an overview, see
[Server](Server.md).

Typically, you'll want server instances that listen for traffic on one or more
ports (this is why they're called "servers", after all). This leads into a key
concept to leverage for creating your custom servers.

### Controllers and routing
LoopBack 4 developers are strongly encouraged to use controllers for their
modules, and this naturally leads to the concept of routing.

No matter what protocol you intend to use for your custom server, you'll need
to use some algorithm to determine _which_ controller and function to send
request data to, and that means you need a router.

For example, consider a "toy protocol" similar to the JSON RPC
specification (but nowhere near as complete or robust).

The toy protocol will require a JSON payload with three properties: `controller`,
`method`, and `input`.

An example request would look something like this:
```json
{
  "controller": "GreetController",
  "method": "basicHello",
  "input": {
    "name": "world",
  }
}
```

You can find the code for our sample RPC server implementation
[over here](https://github.com/strongloop/loopback4-example-rpc-server).

### Trying it out
First, install your dependencies and then start the application:
```
npm i && npm start
```

Now, try it out: start the server and run a few REST requests. Feel free to use
whatever REST client you'd prefer (this example will use `curl`).
```sh
# Basic Greeting Calls
$ curl -X POST -d '{ "controller": "GreetController", "method": "basicHello" }' -H "Content-Type: application/json" http://localhost:3000/
Hello, World!
$ curl -X POST -d '{ "controller": "GreetController", "method": "basicHello", "input": { "name": "Nadine" } }' -H "Content-Type: application/json" http://localhost:3000/
Hello, Nadine!
# Advanced Greeting Calls
$ curl -X POST -d '{ "controller": "GreetController", "method": "hobbyHello", "input": { "name": "Nadine" } }' -H "Content-Type: application/json" http://localhost:3000/
Hello, Nadine! I heard you like underwater basket weaving.
$ curl -X POST -d '{ "controller": "GreetController", "method": "hobbyHello", "input": { "name": "Nadine", "hobby": "extreme mountain biking" } }' -H "Content-Type: application/json" http://localhost:3000/
Hello, Nadine! I heard you like extreme mountain biking.
```

While a typical protocol server would be a lot more involved in the
implementation of both its router and server, the general concept remains
the same, and you can use these tools to make whatever server you'd like.

### Other considerations
Some additional concepts to add to your server could include:
- Pre-processing of requests (changing content types, checking the request body,
etc)
- Post-processing of responses (removing sensitive/useless information)
- Caching
- Logging
- Automatic creation of default endpoints
- and more...

LoopBack 4's modularity allows for custom servers of all kinds, while still
providing key utilities like context and injection to make your work easier.
