---
lang: en
title: 'Binding'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Binding.html
---

## What is Binding?

`Binding` represents items within a [Context](Context.md) instance. A binding
connects its value to a unique key as the address to access the entry in a
context.

### Attributes of a binding

A binding typically has the following attributes:

- key: Each binding has a `key` to uniquely identify itself within the context
- scope: The scope controls how the binding value is created and cached within
  the context
- tags: Tags are names or name/value pairs to describe or annotate a binding
- value: Each binding must be configured with a type of value provider so that
  it can be resolved to a constant or calculated value

![Binding](imgs/binding.png)

## How to create a binding?

There are a few ways to create a binding:

- Use `Binding` constructor:

  ```ts
  import {Context, Binding} from '@loopback/core';
  const context = new Context();
  const binding = new Binding('my-key');
  ctx.add(binding);
  ```

- Use `Binding.bind()`

  ```ts
  import {Context, Binding} from '@loopback/core';
  const context = new Context();
  const binding = Binding.bind('my-key');
  ctx.add(binding);
  ```

- Use `context.bind()`

  ```ts
  import {Context, Binding} from '@loopback/core';
  const context = new Context();
  context.bind('my-key');
  ```

  {% include note.html content="The `@loopback/core` package re-exports all
  public APIs of `@loopback/context`. For consistency, we recommend the usage of
  `@loopback/core` for imports in LoopBack modules and applications unless they
  depend on `@loopback/context` explicitly. The two statements below are
  equivalent:

  ```ts
  import {inject} from '@loopback/context';
  import {inject} from '@loopback/core';
  ```

  " %}

## How to set up a binding?

The `Binding` class provides a set of fluent APIs to create and configure a
binding.

### Supply the value or a way to resolve the value

The value can be supplied in one the following forms:

#### A constant

If binding is always resolved to a fixed value, we can bind it to a constant,
which can be a string, a function, an object, an array, or any other types.

```ts
binding.to('my-value');
```

Please note the constant value cannot be a `Promise` to avoid confusions.

#### A factory function

Sometimes the value needs to be dynamically calculated, such as the current time
or a value fetched from a remote service or database.

```ts
binding.toDynamicValue(() => 'my-value');
binding.toDynamicValue(() => new Date());
binding.toDynamicValue(() => Promise.resolve('my-value'));
```

The factory function can receive extra information about the context, binding,
and resolution options.

```ts
import {ValueFactory} from '@loopback/core';

// The factory function now have access extra metadata about the resolution
const factory: ValueFactory<string> = resolutionCtx => {
  return `Hello, ${resolutionCtx.context.name}#${
    resolutionCtx.binding.key
  } ${resolutionCtx.options.session?.getBindingPath()}`;
};
const b = ctx.bind('msg').toDynamicValue(factory);
```

Object destructuring can be used to further simplify a value factory function
that needs to access `context`, `binding`, or `options`.

```ts
const factory: ValueFactory<string> = ({context, binding, options}) => {
  return `Hello, ${context.name}#${
    binding.key
  } ${options.session?.getBindingPath()}`;
};
```

An advanced form of value factory is a class that has a static `value` method
that allows parameter injection.

```ts
import {inject} from '@loopback/core';

class GreetingProvider {
  static value(@inject('user') user: string) {
    return `Hello, ${user}`;
  }
}

const b = ctx.bind('msg').toDynamicValue(GreetingProvider);
```

#### A class

The binding can represent an instance of a class, for example, a controller. A
class can be used to instantiate an instance as the resolved value. Dependency
injection is often leveraged for its members.

```ts
class MyController {
  constructor(@inject('my-options') private options: MyOptions) {
    // ...
  }
}

binding.toClass(MyController);
```

#### A provider

A provider is a class with `value()` method to calculate the value from its
instance. The main reason to use a provider class is to leverage dependency
injection for the factory function.

```ts
class MyValueProvider implements Provider<string> {
  constructor(@inject('my-options') private options: MyOptions) {
    // ...
  }

  value() {
    return this.options.defaultValue;
  }
}

binding.toProvider(MyValueProvider);
```

The provider class serves as the wrapper to declare dependency injections. If
dependency is not needed, `toDynamicValue` can be used instead.

#### An injectable class

An injectable class is one of the following types of classes optionally
decorated with `@injectable`.

- A class
- A provider class
- A dynamic value factory class

The `toInjectable()` method is a shortcut to bind such classes using
`toClass/toProvider/toDynamicValue` respectively by introspecting the class,
including the binding metadata added by `@injectable`.

```ts
@injectable({scope: BindingScope.SINGLETON})
class MyController {
  constructor(@inject('my-options') private options: MyOptions) {
    // ...
  }
}

binding.toInjectable(MyController);
```

The code above is similar as follows:

```ts
const binding = createBindingFromClass(MyController);
```

{% include note.html content="
If `binding.toClass(MyController)` is used, the binding scope set by
`@injectable` is NOT honored.
" %}

#### An alias

An alias is the key with optional path to resolve the value from another
binding. For example, if we want to get options from RestServer for the API
explorer, we can configure the `apiExplorer.options` to be resolved from
`servers.RestServer.options#apiExplorer`.

```ts
ctx.bind('servers.RestServer.options').to({apiExplorer: {path: '/explorer'}});
ctx
  .bind('apiExplorer.options')
  .toAlias('servers.RestServer.options#apiExplorer');
const apiExplorerOptions = await ctx.get('apiExplorer.options'); // => {path: '/explorer'}
```

### Configure the scope

A binding provides values for requests such as `ctx.get()`, `ctx.getSync()`, and
dependency injections. The binding scope controls whether a binding returns a
new value or share the same value for multiple requests within the same context
hierarchy. For example, `value1` and `value2` in the code below can be different
or the same depending on the scope of Binding(`my-key`).

```ts
const value1 = await ctx.get('my-key');
const value2 = ctx.getSync('my-key');
```

We allow a binding to be resolved within a context using one of the following
scopes:

- BindingScope.TRANSIENT (default)
- BindingScope.CONTEXT (deprecated to favor APPLICATION/SERVER/REQUEST)
- BindingScope.SINGLETON
- BindingScope.APPLICATION
- BindingScope.SERVER
- BindingScope.REQUEST

For a complete list of descriptions, please see
[BindingScope](https://loopback.io/doc/en/lb4/apidocs.context.bindingscope.html).

```ts
binding.inScope(BindingScope.SINGLETON);
```

The binding scope can be accessed via `binding.scope`.

### Choose the right scope

The binding scope should be determined by answers to the following questions:

1. Do you need to have a new value from the binding for each request?
2. Does the resolved value for a binding hold or access states that are request
   specific?

Please note that the binding scope has no effect on bindings created with
`to()`. For example:

```ts
ctx.bind('my-name').to('John Smith');
```

The `my-name` binding will always resolve to `'John Smith'`.

The binding scope will impact values provided by `toDynamicValue`, `toClass`,
and `toProvider`.

Let's say we need to have a binding that gives us the current date.

```ts
ctx.bind('current-date').toDynamicValue(() => new Date());
const d1 = ctx.getSync('current-date');
const d2 = ctx.getSync('current-date');
// d1 !== d2
```

By default, the binding scope is `TRANSIENT`. In the code above, `d1` and `d2`
are resolved by calling `new Date()` for each `getSync('current-date')`. Two
different dates are assigned to `d1` and `d2` to reflect the corresponding date
for each resolution.

Now you can guess the code snippet below will produce the same date for `d1` and
`d2`, which is not desirable.

```ts
ctx
  .bind('current-date')
  .toDynamicValue(() => new Date())
  .inScope(BindingScope.SINGLETON);
const d1 = ctx.getSync<Date>('current-date');
const d2 = ctx.getSync<Date>('current-date');
// d1 === d2
```

The `SINGLETON` scope is useful for some use cases, such as:

1.  Share states in a single instance across multiple consumers of the binding

    ```ts
    export class GlobalCounter {
      public count = 0;
    }

    ctx
      .bind('global-counter')
      .toClass(GlobalCounter)
      .inScope(BindingScope.SINGLETON);
    const c1: GlobalCounter = await ctx.get('global-counter');
    c1.count++; // c1.count is now 1
    const c2: GlobalCounter = await ctx.get('global-counter');
    // c2 is the same instance as c1
    // c2.count is 1 too
    ```

2.  Prevent creation of multiple instances if one single instance can be shared
    as the consumers do not need to hold or access different states

    For example, the following `GreetingController` implementation does not
    access any information beyond the method parameters which are passed in as
    arguments. A shared instance of `GreetingController` can invoke `greet` with
    different arguments, such as `c1.greet('John')` and `c1.greet('Jane')`.

    ```ts
    // Mark the controller class a candidate for singleton binding
    @injectable({scope: BindingScope.SINGLETON})
    export class GreetingController {
      greet(name: string) {
        return `Hello, ${name}`;
      }
    }
    ```

    `GreetingController` is a good candidate to use `SINGLETON` so that only one
    instance is created within the application context and it can be shared by
    all requests. The scope eliminates the overhead to instantiate
    `GreetingController` per request.

    ```ts
    // createBindingFromClass() respects `@injectable` and sets the binding scope to `SINGLETON'
    const binding = ctx.add(createBindingFromClass(GreetingController));
    const c1 = ctx.getSync(binding.key);
    const c2 = ctx.getSync(binding.key);
    // c2 is the same instance as c1
    c1.greet('John'); // invoke c1.greet for 'John' => 'Hello, John'
    c2.greet('Jane'); // invoke c2.greet for 'Jane' => 'Hello, Jane'
    ```

**Rule of thumb**: Use `TRANSIENT` as the safe default and choose `SINGLETON` if
you want to share the same instance for all consumers without breaking
concurrent requests.

Let's look at another use case that we need to access the information from the
current request, such as http url or logged in user:

```ts
export class GreetingCurrentUserController {
  @inject(SecurityBindings.USER)
  private currentUserProfile: UserProfile;

  greet() {
    return `Hello, ${this.currentUserProfile.name}`;
  }
}
```

Instances of `GreetingCurrentUserController` depend on `currentUserProfile`,
which is injected as a property. We have to use `TRANSIENT` scope so that a new
instance is created per request to hold the logged in user for each request.

The constraint of being transient can be lifted by using method parameter
injection to move the request-specific injection to parameters per method
invocation.

```ts
export class SingletonGreetingCurrentUserController {
  greet(@inject(SecurityBindings.USER) currentUserProfile: UserProfile) {
    return `Hello, ${this.currentUserProfile.name}`;
  }
}
```

The new implementation above does not hold request specific states as properties
in its instances anymore and thus it's qualified to be in `SINGLETON` scope.

```ts
ctx
  .bind('controllers.SingletonGreetingCurrentUserController')
  .toClass(SingletonGreetingCurrentUserController)
  .inScope(BindingScope.SINGLETON);
```

A single instance of `SingletonGreetingCurrentUserController` is created within
the context that contains the binding. But the `greet` method can still be
invoked with different request contexts, each of which has its own logged in
user. Method parameter injections are fulfilled with the request context, which
can be different from the context (such as `application`) used to instantiate
the class as a singleton.

{% include note.html content="
To understand the difference between `@bind()/@injectable` and `ctx.bind()`, see
[Configure binding attributes for a class](#configure-binding-attributes-for-a-class).
" %}

There are some limitation of `SINGLETON`, `CONTEXT`, and `TRANSIENT` scopes.
Consider the following typical context hierarchy formed by a LoopBack REST
application:

```ts
// We have a context chain: invocationCtx -> requestCtx -> serverCtx -> appCtx
appCtx
  .bind('services.MyService')
  .toClass(MyService)
  .inScope(BindingScope.TRANSIENT);
```

We use `TRANSIENT` scope for controllers/services so that each request will get
a new instance. But if a controller/service is resolved within the
`invocationCtx` (by interceptors), a new instance will be created again.

```ts
// In a middleware
const serviceInst1 = requestCtx.get<MyService>('services.MyService');
// In an interceptor
const serviceInst2 = invocationCtx.get<MyService>('services.MyService');
// serviceInst2 is a new instance and it's NOT the same as serviceInst1
```

It can also happen with dependency injections:

```ts
class MyMiddlewareProvider implements Provider<Middleware> {
  constructor(@inject('services.MyService') private myService) {}
}

class MyInterceptor {
  constructor(@inject('services.MyService') private myService) {}
}

// For the same request, the middleware and interceptor will receive two different
// instances of `MyService`
```

Ideally, we should get the same instance at the subtree of the `requestCtx`.
Even worse, resolving a binding twice in the same reqCtx will get two different
instances too.

Neither `SINGLETON` or `CONTEXT` can satisfy this requirement. Typically,
controllers/servers are discovered and loaded into the application context.
Those from components such as RestComponent also contribute bindings to the
`appCtx` instead of `serverCtx`. With `SINGLETON` scope, we will get one
instance at the `appCtx` level. With `CONTEXT` scope, we will get one instance
per context. A set of fine-grained scopes has been introduced to allow better
scoping of binding resolutions.

- BindingScope.APPLICATION
- BindingScope.SERVER
- BindingScope.REQUEST

The scopes above are checked against the context hierarchy to find the first
matching context for a given scope in the chain. Resolved binding values will be
cached and shared on the scoped context. This ensures a binding to have the same
value for the scoped context.

{% include note.html content="In some cases (especially for tests), no context
with `REQUEST` scope exists in the chain. The resolution falls back to the
current context. This behavior makes it easy to use `REQUEST` as the default
scope for controllers and other artifacts.
" %}

```ts
// We have a context chain: invocationCtx -> requestCtx -> serverCtx -> appCtx
appCtx
  .bind('services.MyService')
  .toClass(MyService)
  .inScope(BindingScope.REQUEST);
```

Now the same instance of MyService will be resolved in the `MyMiddleware` and
`MyInterceptor`.

### Resolve a binding value by key and scope within a context hierarchy

Binding resolution happens explicitly with `ctx.get()`, `ctx.getSync()`, or
`binding.getValue(ctx)`. It may be also triggered with dependency injections
when a class is instantiated or a method is invoked.

Within a context hierarchy, resolving a binding involves the following context
objects, which can be the same or different depending on the context chain and
binding scopes.

Let's assume we have a context chain configured as follows:

```ts
import {Context} from '@loopback/core';

const appCtx = new Context('application');
appCtx.scope = BindingScope.APPLICATION;

const serverCtx = new Context(appCtx, 'server');
serverCtx.scope = BindingScope.SERVER;

const reqCtx = new Context(serverCtx, 'request');
reqCtx.scope = BindingScope.REQUEST;
```

1.  The owner context

    The owner context is the context in which a binding is registered by
    `ctx.bind()` or `ctx.add()` APIs.

    Let's add some bindings to the context chain.

    ```ts
    appCtx.bind('foo.app').to('app.bar');
    serverCtx.bind('foo.server').to('server.bar');
    ```

    The owner context for the code snippet above will be:

    - 'foo.app': appCtx
    - 'foo.server': serverCtx

2.  The current context

    The current context is either the one that is explicitly passed in APIs that
    starts the resolution or implicitly used to inject dependencies. For
    dependency injections, it will be the resolution context of the owning class
    binding. For example, the current context is `reqCtx` for the statement
    below:

    ```ts
    const val = await reqCtx.get('foo.app');
    ```

3.  The resolution context

    The resolution context is the context in the chain that will be used to find
    bindings by key. Only the resolution context itself and its ancestors are
    visible for the binding resolution.

    The resolution context is determined for a binding key as follows:

    a. Find the first binding with the given key in the current context or its
    ancestors recursively

    b. Use the scope of binding found to locate the resolution context:

    - Use the `current context` for `CONTEXT` and `TRANSIENT` scopes
    - Use the `owner context` for `SINGLETON` scope
    - Use the first context that matches the binding scope in the chain starting
      from the current context and traversing to its ancestors for
      `APPLICATION`, `SERVER` and `REQUEST` scopes

    For example:

    ```ts
    import {generateUniqueId} from '@loopback/core';

    appCtx.bind('foo').to('app.bar');
    serverCtx
      .bind('foo')
      .toDynamicValue(() => `foo.server.${generateUniqueId()}`)
      .inScope(BindingScope.SERVER);

    serverCtx
      .bind('xyz')
      .toDynamicValue(() => `abc.server.${generateUniqueId()}`)
      .inScope(BindingScope.SINGLETON);

    const val = await reqCtx.get('foo');
    const appVal = await appCtx.get('foo');
    const xyz = await reqCtx.get('xyz');
    ```

    For `const val = await reqCtx.get('foo');`, the binding will be `foo`
    (scope=SERVER) in the `serverCtx` and resolution context will be
    `serverCtx`.

    For `const appVal = await appCtx.get('foo');`, the binding will be `foo`
    (scope=TRANSIENT) in the `appCtx` and resolution context will be `appCtx`.

    For `const xyz = await reqCtx.get('xyz');`, the binding will be `xyz`
    (scope=SINGLETON) in the `serverCtx` and resolution context will be
    `serverCtx`.

    For dependency injections, the `current context` will be the
    `resolution context` of the class binding that declares injections. The
    `resolution context` will be located for each injection. If the bindings to
    be injected is NOT visible (either the key does not exist or only exists in
    descendant) to the `resolution context`, an error will be reported.

{% include note.html content="If the owner context happens to be same as the
resolution context, the `APPLICATION/SERVER/REQUEST` scope is equivalent as
`SINGLETON` scope. For example, the following two bindings behave the same way
as each other.

```ts
let count = 0;
appCtx
  .bind('app.counter')
  .toDynamicValue(() => count++)
  .inScope(BindingScope.APPLICATION);
```

```ts
let count = 0;
appCtx
  .bind('app.counter')
  .toDynamicValue(() => count++)
  .inScope(BindingScope.SINGLETON);
```

" %}

### Refresh a binding with non-transient scopes

`SINGLETON`/`CONTEXT`/`APPLICATION`/`SERVER` scopes can be used to minimize the
number of value instances created for a given binding. But sometimes we would
like to force reloading of a binding when its configuration or dependencies are
changed. For example, a logging provider can be refreshed to pick up a new
logging level. The same functionality can be achieved with `TRANSIENT` scope but
with much more overhead.

The `binding.refresh()` method invalidates the cache so that its value will be
reloaded next time.

**WARNING: The state held in the cached value will be gone.**

```ts
let logLevel = 1; // 'info'

// Logging configuration
export interface LoggingOptions {
  level: number;
}

// A simple logger
export class Logger {
  constructor(@config() private options: LoggingOptions) {}

  log(level: string, message: string) {
    if (this.options.level >= level) {
      console.log('[%d] %s', level, message);
    }
  }
}

// Bind the logger
const binding = ctx
  .bind('logger')
  .toClass(Logger)
  .inScope(BindingScope.SINGLETON);

// Start with `info` level logging
ctx.configure(binding.key).to({level: 1});
const logger = await ctx.get<Logger>('logger');
logger.log(1, 'info message'); // Prints to console
logger.log(5, 'debug message'); // Does not print to console

// Now change the configuration to enable debugging
ctx.configure(binding.key).to({level: 5});
// Force a refresh on the binding
binding.refresh(ctx);

const newLogger = await ctx.get<Logger>('logger');
newLogger.log(1, 'info message'); // Prints to console
newLogger.log(5, 'debug message'); // Prints to console too!
```

### Describe tags

Tags can be used to annotate bindings so that they can be grouped or searched.
For example, we can tag a binding as a `controller` or `repository`. The tags
are often introduced by an extension point to mark its extensions contributed by
other components.

There are two types of tags:

- Simple tag - a tag string, such as `'controller'`
- Value tag - a name/value pair, such as `{name: 'MyController'}`

Internally, we use the tag name as its value for simple tags, for example,
`{controller: 'controller'}`.

```ts
binding.tag('controller');
binding.tag('controller', {name: 'MyController'});
```

The binding tags can be accessed via `binding.tagMap` or `binding.tagNames`.

Binding tags play an import role in discovering artifacts with matching tags.
The `filterByTag` helper function and `context.findByTag` method can be used to
match/find bindings by tag. The search criteria can be one of the followings:

1. A tag name, such as `controller`
2. A tag name wildcard or regular expression, such as `controller.*` or
   `/controller/`
3. An object contains tag name/value pairs, such as
   `{name: 'my-controller', type: 'controller'}`. In addition to exact match,
   the value for a tag name can be a function that determines if a given tag
   value matches. For example,

   ```ts
   import {
     ANY_TAG_VALUE, // Match any value if it exists
     filterByTag,
     includesTagValue, // Match tag value as an array that includes the item
     TagValueMatcher,
   } from '@loopback/core';
   // Match a binding with a named service
   ctx.find(filterByTag({name: ANY_TAG_VALUE, service: 'service'}));

   // Match a binding as an extension for `my-extension-point`
   ctx.find(
     filterByTag({extensionFor: includesTagValue('my-extension-point')}),
   );

   // Match a binding with weight > 100
   const weightMatcher: TagValueMatcher = tagValue => tagValue > 100;
   ctx.find(filterByTag({weight: weightMatcher}));
   ```

### Chain multiple steps

The `Binding` fluent APIs allow us to chain multiple steps as follows:

```ts
context.bind('my-key').to('my-value').tag('my-tag');
```

### Apply a template function

It's common that we want to configure certain bindings with the same attributes
such as tags and scope. To allow such setting, use `binding.apply()`:

```ts
export const serverTemplate = (binding: Binding) =>
  binding.inScope(BindingScope.SINGLETON).tag('server');
```

```ts
const serverBinding = new Binding<RestServer>('servers.RestServer1');
serverBinding.apply(serverTemplate);
```

### Configure binding attributes for a class

Classes can be discovered and bound to the application context during `boot`. In
addition to conventions, it's often desirable to allow certain binding
attributes, such as scope and tags, to be specified as metadata for the class.
When the class is bound, these attributes are honored to create a binding. You
can use `@injectable` decorator to configure how to bind a class.

```ts
import {injectable, BindingScope} from '@loopback/core';

// @injectable() accepts scope and tags
@injectable({
  scope: BindingScope.SINGLETON,
  tags: ['service'],
})
export class MyService {}

// @binding.provider is a shortcut for a provider class
@injectable.provider({
  tags: {
    key: 'my-date-provider',
  },
})
export class MyDateProvider implements Provider<Date> {
  value() {
    return new Date();
  }
}

@injectable({
  tags: ['controller', {name: 'my-controller'}],
})
export class MyController {}

// @injectable() can take one or more binding template functions
@injectable(binding => binding.tag('controller', {name: 'your-controller'})
export class YourController {}
```

Then a binding can be created by inspecting the class,

```ts
import {createBindingFromClass} from '@loopback/core';

const ctx = new Context();
const binding = createBindingFromClass(MyService);
ctx.add(binding);
```

Please note `createBindingFromClass` also accepts an optional `options`
parameter of `BindingFromClassOptions` type with the following settings:

- key: Binding key, such as `controllers.MyController`
- type: Artifact type, such as `server`, `controller`, `repository` or `service`
- name: Artifact name, such as `my-rest-server` and `my-controller`, default to
  the name of the bound class
- namespace: Namespace for the binding key, such as `servers` and `controllers`.
  If `key` does not exist, its value is calculated as `<namespace>.<name>`.
- typeNamespaceMapping: Mapping artifact type to binding key namespaces, such
  as:

  ```ts
  {
    controller: 'controllers',
    repository: 'repositories'
  }
  ```

- defaultNamespace: Default namespace if namespace or namespace tag does not
  exist
- defaultScope: Default scope if the binding does not have an explicit scope
  set. The `scope` from `@injectable` of the bound class takes precedence.

{% include note.html content=" The `@injectable` decorator only adds metadata to
the class. It does NOT automatically bind the class to a context. To bind a
class with `@injectable` decoration, the following step needs to happen
explicitly or implicitly by a [booter](Booting-an-Application.md#booters).

```ts
const binding = createBindingFromClass(AClassOrProviderWithBindDecoration);
ctx.add(binding);
```

The metadata added by `@injectable` is **NOT** inspected/honored by `toClass` or
`toProvider`. Be warned that the example below does NOT set up the binding per
`@injectable` decoration:

```ts
const binding = ctx.bind('my-key').toClass(MyService);
// The binding is NOT configured based on the `@injectable` decoration on MyService.
// The scope is BindingScope.TRANSIENT (not BindingScope.SINGLETON).
// There is no tag named 'service' for the binding either.
```

" %}

The `createBindingFromClass` can be used for three kinds of classes as the value
provider for bindings.

1. The class for `toClass()`

   ```ts
   @injectable({tags: {greeting: 'a'}})
   class Greeter {
     constructor(@inject('currentUser') private user: string) {}

     greet() {
       return `Hello, ${this.user}`;
     }
   }

   // toClass() is used internally
   // A tag `{type: 'class'}` is added
   const binding = createBindingFromClass(Greeter);
   ctx.add(binding);
   ```

2. The class for `toProvider()`

```ts
@injectable({tags: {greeting: 'b'}})
class GreetingProvider implements Provider<string> {
  constructor(@inject('currentUser') private user: string) {}

  value() {
    return `Hello, ${this.user}`;
  }
}

// toProvider() is used internally
// A tag `{type: 'provider'}` is added
const binding = createBindingFromClass(GreetingProvider);
ctx.add(binding);
```

3. The class for `toDynamicValue()`

```ts
@injectable({tags: {greeting: 'c'}})
class DynamicGreetingProvider {
  static value(@inject('currentUser') user: string) {
    return `Hello, ${this.user}`;
  }
}

// toDynamicValue() is used internally
// A tag `{type: 'dynamicValueProvider'}` is added
const binding = createBindingFromClass(GreetingProvider);
ctx.add(binding);
```

The `@injectable` is optional for such classes. But it's usually there to
provide additional metadata such as scope and tags for the binding. Without
`@injectable`, `createFromClass` simply calls underlying `toClass`,
`toProvider`, or `toDynamicValue` based on the class signature.

#### When to call createBindingFromClass

Classes that are placed in specific directories such as : `src/datasources`,
`src/controllers`, `src/services`, `src/repositories`, `src/observers`,
`src/interceptors`, etc are automatically registered by
[the boot process](Booting-an-Application.md), and so it is **not** necessary to
call

```ts
const binding = createBindingFromClass(AClassOrProviderWithBindDecoration);
ctx.add(binding);
```

in your application.

If, on the other hand, your classes are placed in different directories expected
by the boot process, then it is necessary to call the code above in your
application.

##### How the Boot Process Calls createBindingFromClass for you

A default LoopBack 4 application uses
[BootMixin](Booting-an-Application.md#bootmixin) which loads the
[BootComponent](Booting-an-Application.md#bootcomponent). It declares the main
[booters](https://github.com/strongloop/loopback-next/blob/a81ce7e1193f7408d30d984d0c3ddcec74f7c316/packages/boot/src/boot.component.ts#L29)
for an application : application metadata, controllers, repositories, services,
datasources, lifecycle observers, interceptors, and model api. The
[ControllerBooter](https://github.com/strongloop/loopback-next/blob/a81ce7e1193f7408d30d984d0c3ddcec74f7c316/packages/boot/src/booters/controller.booter.ts#L23),
for example, calls `this.app.controller(controllerClass)` for every controller
class discovered in the `controllers` folder. This
[method](https://github.com/strongloop/loopback-next/blob/da9a7e72b12ebb9250214b92dc20a268a8bb7e95/packages/core/src/application.ts#L124)
does all the work for you; as shown below:

{% include code-caption.html content="loopback-next/packages/core/src/application.ts" %}

```ts
  controller(controllerCtor: ControllerClass, name?: string): Binding {
    debug('Adding controller %s', name ?? controllerCtor.name);
    const binding = createBindingFromClass(controllerCtor, {
      name,
      namespace: CoreBindings.CONTROLLERS,
      type: CoreTags.CONTROLLER,
      defaultScope: BindingScope.TRANSIENT,
    });
    this.add(binding);
    return binding;
  }
```

### Encoding value types in binding keys

String keys for bindings do not help enforce the value type. Consider the
example from the previous section:

```ts
app.bind('hello').to('world');
console.log(app.getSync<string>('hello'));
```

The code obtaining the bound value is explicitly specifying the type of this
value. Such solution is far from ideal:

1.  Consumers have to know the exact name of the type that's associated with
    each binding key and also where to import it from.
2.  Consumers must explicitly provide this type to the compiler when calling
    ctx.get in order to benefit from compile-type checks.
3.  It's easy to accidentally provide a wrong type when retrieving the value and
    get a false sense of security.

The third point is important because the bugs can be subtle and difficult to
spot.

Consider the following REST binding key:

```ts
export const HOST = 'rest.host';
```

The binding key does not provide any indication that `undefined` is a valid
value for the HOST binding. Without that knowledge, one could write the
following code and get it accepted by TypeScript compiler, only to learn at
runtime that HOST may be also undefined and the code needs to find the server's
host name using a different way.:

```ts
const resolve = promisify(dns.resolve);

const host = await ctx.get<string>(RestBindings.HOST);
const records = await resolve(host);
// etc.
```

To address this problem, LoopBack provides a templated wrapper class allowing
binding keys to encode the value type too. The `HOST` binding described above
can be defined as follows:

```ts
export const HOST = new BindingKey<string | undefined>('rest.host');
```

Context methods like `.get()` and `.getSync()` understand this wrapper and use
the value type from the binding key to describe the type of the value they are
returning themselves. This allows binding consumers to omit the expected value
type when calling `.get()` and `.getSync()`.

When we rewrite the failing snippet resolving HOST names to use the new API, the
TypeScript compiler immediately tells us about the problem:

```ts
const host = await ctx.get(RestBindings.HOST);
const records = await resolve(host);
// Compiler complains:
// - cannot convert string | undefined to string
//  - cannot convert undefined to string
```

### Binding events

A binding can emit `changed` events upon changes triggered by methods such as
`tag`, `inScope`, `to`, and `toClass`.

The binding listener function signature is described as:

```ts
/**
 * Information for a binding event
 */
export type BindingEvent = {
  /**
   * Event type
   */
  type: string;
  /**
   * Source binding that emits the event
   */
  binding: Readonly<Binding<unknown>>;
  /**
   * Operation that triggers the event
   */
  operation: string;
};

/**
 * Event listeners for binding events
 */
export type BindingEventListener = (
  /**
   * Binding event
   */
  event: BindingEvent,
) => void;
```

Now we can register a binding listener to be triggered when tags are changed:

```ts
const bindingListener: BindingEventListener = ({binding, operation}) => {
  if (event === 'tag') {
    console.log('Binding tags for %s %j', binding.key, binding.tagMap);
  }
});

binding.on('changed', bindingListener);
```
