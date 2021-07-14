---
lang: en
title: 'Creating components'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Components
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Creating-components.html
---

As explained in [Using Components](Component.md#using-components), a typical
LoopBack component is an npm package exporting a Component class.

```ts
import {MyController} from './controllers/my.controller';
import {MyValueProvider} from './providers/my-value.provider';
import {Component} from '@loopback/core';

export class MyComponent implements Component {
  servers = {
    'my-server': MyServer,
  };
  lifeCycleObservers = [MyObserver];
  controllers = [MyController];
  providers = {
    'my-value': MyValueProvider,
  };
  classes = {
    'my-validator': MyValidator,
  };

  constructor() {
    // Set up `bindings`
    const bindingX = Binding.bind('x').to('Value X');
    const bindingY = Binding.bind('y').toClass(ClassY);
    this.bindings = [bindingX, bindingY];
  }
}
```

## Working with dependencies

Extensions should preferably use LoopBack modules installed by the target
application, to allow application developers to choose the version of framework
modules they want to use. For example, they may want to hold to an older version
until a regression is fixed in the latest version, or even use their own fork to
have a bug fix available before it's officially published.

We recommend to use `peerDependencies` to specify what packages is your
extension expecting in the target application and `devDependencies` to make
these packages available for extension tests.

For example:

```json
{
  "name": "my-lb4-extension",
  "version": "1.0.0",
  "dependencies": {
    "tslib": "^2.0.0"
  },
  "peerDependencies": {
    "@loopback/core": "^2.9.1",
    "@loopback/rest": "^5.2.0"
  },
  "devDependencies": {
    "@loopback/build": "^6.1.0",
    "@loopback/core": "^2.9.1",
    "@loopback/eslint-config": "^8.0.3",
    "@loopback/rest": "^5.2.0",
    "@loopback/testlab": "^3.2.0"
  }
}
```

It is also possible for a single extension version to support multiple versions
of a framework dependency:

```json
{
  "peerDependencies": {
    "@loopback/core": "^1.9.0 || ^2.0.0"
  }
}
```

{% include important.html content=' Shrinking the supported version range of a
peer dependency is a breaking change that should trigger a semver-major release.

For example, changing the range from `"^1.5.3"` to `"^1.5.3 || ^2.0.0"` is
backwards compatible, while changing the range from `"^1.5.3"` to `"^2.0.0"` is
a breaking change. ' %}

## Injecting the target application instance

You can inject anything from the context and access them from a component. In
the following example, the REST application instance is made available in the
component via dependency injection.

```ts
import {inject, Component, CoreBindings} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
export class MyComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: RestApplication,
  ) {
    // The rest application instance can be accessed from this component
  }
}
```

## Registration of component artifacts

When a component is mounted to an application, a new instance of the component
class is created and then:

- Each Controller class is registered via `app.controller()`,
- Each Provider is bound to its key in `providers` object via
  `app.bind(key).toProvider(providerClass)`
- Each Class is bound to its key in `classes` object via
  `app.bind(key).toClass(cls)`
- Each Binding is added via `app.add(binding)`
- Each Server class is registered via `app.server()`
- Each LifeCycleObserver class is registered via `app.lifeCycleObserver()`

Please note that `providers` and `classes` are shortcuts for provider and class
`bindings`.

The example `MyComponent` above will add `MyController` to application's API and
create the following bindings in the application context:

- `my-value` -> `MyValueProvider` (provider)
- `my-validator` -> `MyValidator` (class)
- `x` -> `'Value X'` (value)
- `y` -> `ClassY` (class)
- `my-server` -> `MyServer` (server)
- `lifeCycleObservers.MyObserver` -> `MyObserver` (life cycle observer)

### Supported component artifacts

When a component is mounted using `App.component()`, certain properties in a
component are checked to mount certain artifacts. While some artifacts can be
mounted using a bare LoopBack 4 application, others require the application to
be extended by a mixin.

The table below describes the supported properties in the core LoopBack 4
packages, and the required mixin (if applicable).

{% include important.html content="If an app is not extended with the required Mixin(s), the dependent artifact(s) will be silently disregarded." %}

| Artifact           | Property             | Mixins            |
| ------------------ | -------------------- | ----------------- |
| Binding            | `bindings`           | N/A               |
| Class              | `classes`            | N/A               |
| Lifecycle Observer | `lifeCycleObservers` | N/A               |
| Controller         | `controllers`        | N/A               |
| Model              | `models`             | `RepositoryMixin` |
| Provider           | `providers`          | N/A               |
| Repository         | `repositories`       | `RepositoryMixin` |
| Server             | `servers`            | N/A               |
| Service            | `services`           | N/A               |

## Providers

Providers enable components to export values that can be used by the target
application or other components. The `Provider` class provides a `value()`
function called by [Context](Context.md) when another entity requests a value to
be injected.

```ts
import {Provider} from '@loopback/core';

export class MyValueProvider implements Provider<string> {
  value() {
    return 'Hello world';
  }
}
```

### Specifying binding key

Notice that the provider class itself does not specify any binding key, the key
is assigned by the component class.

```ts
import {MyValueProvider} from './providers/my-value.provider';

export class MyComponent implements Component {
  constructor() {
    this.providers = {
      'my-component.my-value': MyValueProvider,
    };
  }
}
```

We recommend to component authors to use
[Typed binding keys](./Context.md#encoding-value-types-in-binding-keys) instead
of string keys and to export an object (a TypeScript namespace) providing
constants for all binding keys defined by the component.

```ts
import {MyValue, MyValueProvider} from './providers/my-value-provider';

export namespace MyComponentKeys {
  export const MY_VALUE = new BindingKey<MyValue>('my-component.my-value');
}

export class MyComponent implements Component {
  constructor() {
    this.providers = {
      [MyComponentKeys.MY_VALUE.key]: MyValueProvider,
    };
  }
}
```

### Accessing values from Providers

Applications can use `@inject` decorators to access the value of an exported
Provider. If you’re not familiar with decorators in TypeScript, see
[Key Concepts: Decorators](Decorators.md)

```ts
const app = new Application();
app.component(MyComponent);

class MyController {
  constructor(@inject('my-component.my-value') private greeting: string) {}

  @get('/greet')
  greet() {
    return this.greeting;
  }
}
```

{% include note.html title="A note on binding names" content="
To avoid name conflicts, add a unique prefix to your binding key (for example, `my-component.`
in the example above). See [Reserved binding keys](reference/reserved-binding-keys.md) for
the list of keys reserved for the framework use.
" %}

### Asynchronous providers

Provider's `value()` method can be asynchronous too:

```ts
import {Provider} from '@loopback/core';
const request = require('request-promise-native');
const weatherUrl =
  'http://samples.openweathermap.org/data/2.5/weather?appid=b1b15e88fa797225412429c1c50c122a1';

export class CurrentTemperatureProvider implements Provider<number> {
  async value() {
    const data = await request(`${weatherUrl}&q=Prague,CZ`, {json: true});
    return data.main.temp;
  }
}
```

In this case, LoopBack will wait until the promise returned by `value()` is
resolved, and use the resolved value for dependency injection.

### Working with HTTP request/response

In some cases, the Provider may depend on other parts of LoopBack; for example
the current `request` object. The Provider's constructor should list such
dependencies annotated with `@inject` keyword, so that LoopBack runtime can
resolve them automatically.

```ts
import {Provider} from '@loopback/core';
import {Request, RestBindings} from '@loopback/rest';
import {v4 as uuid} from 'uuid';

class CorrelationIdProvider implements Provider<string> {
  constructor(@inject(RestBindings.Http.REQUEST) private request: Request) {}

  value() {
    return this.request.headers['X-Correlation-Id'] || uuid();
  }
}
```

## Modifying request handling logic

A frequent use case for components is to modify the way requests are handled.
For example, the authentication component needs to verify user credentials
before the actual handler can be invoked; or a logger component needs to record
start time and write a log entry when the request has been handled.

The idiomatic solution has two parts:

1.  The component should define and bind a new
    [Sequence action](Sequence.md#actions), for example
    `authentication.actions.authenticate`:

    ```ts
    import {Component} from '@loopback/core';

    export namespace AuthenticationBindings {
      export const AUTH_ACTION = BindingKey.create<AuthenticateFn>(
        'authentication.actions.authenticate',
      );
    }

    class AuthenticationComponent implements Component {
      constructor() {
        this.providers = {
          [AuthenticationBindings.AUTH_ACTION.key]: AuthenticateActionProvider,
        };
      }
    }
    ```

    A sequence action is typically implemented as an `action()` method in the
    provider.

    ```ts
    class AuthenticateActionProvider implements Provider<AuthenticateFn> {
      // Provider interface
      value() {
        return request => this.action(request);
      }

      // The sequence action
      action(request): UserProfile | undefined {
        // authenticate the user
      }
    }
    ```

    It may be tempting to put action implementation directly inside the
    anonymous arrow function returned by provider's `value()` method. We
    consider that as a bad practice though, because when an error occurs, the
    stack trace will contain only an anonymous function that makes it more
    difficult to link the entry with the sequence action.

2.  The application should use a custom `Sequence` class which calls this new
    sequence action in an appropriate place.

    ```ts
    class AppSequence implements SequenceHandler {
      constructor(
        @inject(RestBindings.SequenceActions.FIND_ROUTE)
        protected findRoute: FindRoute,
        @inject(RestBindings.SequenceActions.PARSE_PARAMS)
        protected parseParams: ParseParams,
        @inject(RestBindings.SequenceActions.INVOKE_METHOD)
        protected invoke: InvokeMethod,
        @inject(RestBindings.SequenceActions.SEND) public send: Send,
        @inject(RestBindings.SequenceActions.REJECT) public reject: Reject,
        // Inject the new action here:
        @inject('authentication.actions.authenticate')
        protected authenticate: AuthenticateFn,
      ) {}

      async handle(context: RequestContext) {
        try {
          const {request, response} = context;
          const route = this.findRoute(request);

          // Invoke the new action:
          const user = await this.authenticate(request);

          const args = await parseOperationArgs(request, route);
          const result = await this.invoke(route, args);
          this.send(response, result);
        } catch (error) {
          this.reject(context, err);
        }
      }
    }
    ```

### Accessing Elements contributed by other Sequence Actions

When writing a custom sequence action, you need to access Elements contributed
by other actions run in the sequence. For example, `authenticate()` action needs
information about the invoked route to decide whether and how to authenticate
the request.

Because all Actions are resolved before the Sequence `handle` function is run,
Elements contributed by Actions are not available for injection yet. To solve
this problem, use `@inject.getter` decorator to obtain a getter function instead
of the actual value. This allows you to defer resolution of your dependency only
until the sequence action contributing this value has already finished.

```ts
export class AuthenticateActionProvider implements Provider<AuthenticateFn> {
  constructor(
    @inject.getter(BindingKeys.Authentication.STRATEGY) readonly getStrategy,
  ) {}

  value() {
    return request => this.action(request);
  }

  async action(request): Promise<UserProfile | undefined> {
    const strategy = await this.getStrategy();
    // ...
  }
}
```

### Contributing Elements from Sequence Actions

Use `@inject.setter` decorator to obtain a setter function that can be used to
contribute new Elements to the request context.

```ts
export class AuthenticateActionProvider implements Provider<AuthenticateFn> {
  constructor(
    @inject.getter(BindingKeys.Authentication.STRATEGY) readonly getStrategy,
    @inject.setter(BindingKeys.Authentication.CURRENT_USER)
    readonly setCurrentUser,
  ) {}

  value() {
    return request => this.action(request);
  }

  async action(request): UserProfile | undefined {
    const strategy = await this.getStrategy();
    // (authenticate the request using the obtained strategy)
    const user = this.setCurrentUser(user);
    return user;
  }
}
```

## Extending Application with Mixins

When binding a component to an app, you may want to extend the app with the
component's properties and methods by using mixins.

An example of how a mixin leverages a component is `RepositoryMixin`. Suppose an
app has multiple components with repositories bound to each of them. You can use
function `RepositoryMixin()` to mount those repositories to application level
context.

The following snippet is an abbreviated function
[`RepositoryMixin`](https://github.com/strongloop/loopback-next/blob/master/packages/repository/src/mixins/repository.mixin.ts):

{% include code-caption.html content="src/mixins/repository.mixin.ts" %}

```ts
export function RepositoryMixin<T extends MixinTarget<Application>>(superClass: T) {
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

```ts
import {RepositoryMixin} from 'src/mixins/repository.mixin';
import {Application} from '@loopback/core';
import {FooComponent} from 'src/foo.component';

class AppWithRepoMixin extends RepositoryMixin(Application) {}
let app = new AppWithRepoMixin();
app.component(FooComponent);

// `app.find` returns all repositories in FooComponent
app.find('repositories.*');
```

## Configuring components

Components can be configured by an app by calling `this.configure()` in its
constructor, and the configuration object can be injected into the component
constructor using the `@config()` decorator.

{% include code-caption.html content="mycomponent.ts" %}

```ts
export class MyComponent implements Component {
  constructor(
    @config()
    options: MyComponentOptions = {enableLogging: false},
  ) {
    if (options.enableLogging) {
      // do logging
    } else {
      // no logging
    }
  }
}
```

{% include code-caption.html content="application.ts" %}

```ts
...
// MyComponent.COMPONENT is the binding key of MyComponent
this.configure(MyComponent.COMPONENT).to({
  enableLogging: true,
});
this.component(MyComponent);
...
```
