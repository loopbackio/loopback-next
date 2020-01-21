---
lang: en
title: 'Binding'
keywords: LoopBack 4.0, LoopBack 4
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
  it be resolved to a constant or calculated value

![Binding](imgs/binding.png)

## How to create a binding?

There are a few ways to create a binding:

- Use `Binding` constructor:

  ```ts
  const binding = new Binding('my-key');
  ```

- Use `Binding.bind()`

  ```ts
  const binding = Binding.bind('my-key');
  ```

- Use `context.bind()`

  ```ts
  const context = new Context();
  context.bind('my-key');
  ```

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
- BindingScope.CONTEXT
- BindingScope.SINGLETON

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
    @bind({scope: BindingScope.SINGLETON})
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
    // createBindingFromClass() respects `@bind` and sets the binding scope to `SINGLETON'
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
To understand the difference between `@bind()` and `ctx.bind()`, see
[Configure binding attributes for a class](#configure-binding-attributes-for-a-class).
" %}

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

### Chain multiple steps

The `Binding` fluent APIs allow us to chain multiple steps as follows:

```ts
context
  .bind('my-key')
  .to('my-value')
  .tag('my-tag');
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
can use `@bind` decorator to configure how to bind a class.

```ts
import {bind, BindingScope} from '@loopback/context';

// @bind() accepts scope and tags
@bind({
  scope: BindingScope.SINGLETON,
  tags: ['service'],
})
export class MyService {}

// @binding.provider is a shortcut for a provider class
@bind.provider({
  tags: {
    key: 'my-date-provider',
  },
})
export class MyDateProvider implements Provider<Date> {
  value() {
    return new Date();
  }
}

@bind({
  tags: ['controller', {name: 'my-controller'}],
})
export class MyController {}

// @bind() can take one or more binding template functions
@bind(binding => binding.tag('controller', {name: 'your-controller'})
export class YourController {}
```

Then a binding can be created by inspecting the class,

```ts
import {createBindingFromClass} from '@loopback/context';

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

- defaultScope: Default scope if the binding does not have an explicit scope
  set. The `scope` from `@bind` of the bound class takes precedence.

{% include note.html content=" The `@bind` decorator only adds metadata to the
class. It does NOT automatically bind the class to a context. To bind a class
with `@bind` decoration, the following step needs to happen explicitly or
implicitly (by a booter).

```ts
const binding = createBindingFromClass(AClassOrProviderWithBindDecoration);
ctx.add(binding);
```

The metadata added by `@bind` is **NOT** inspected/honored by `toClass` or
`toProvider`. Be warned that the example below does NOT set up the binding per
`@bind` decoration:

```ts
const binding = ctx.bind('my-key').toClass(MyService);
// The binding is NOT configured based on the `@bind` decoration on MyService.
// The scope is BindingScope.TRANSIENT (not BindingScope.SINGLETON).
// There is no tag named 'service' for the binding either.
```

" %}

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
