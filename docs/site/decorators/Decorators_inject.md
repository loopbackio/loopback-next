---
lang: en
title: 'Dependency Injection Decorators'
keywords: LoopBack 4.0, LoopBack-Next
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Decorators_inject.html
---

## Dependency Injection Decorators

### @inject

Syntax:
`@inject(bindingSelector: BindingSelector, metadata?: InjectionMetadata)`.

`@inject` is a decorator to annotate class properties or constructor arguments
for automatic injection by LoopBack's IoC container.

The injected values are applied to a constructed instance, so it can only be
used on non-static properties or constructor parameters of a Class.

The `@inject` decorator allows you to inject dependencies bound to any
implementation of the [Context](Context.md) object, such as an Application
instance or a request context instance. You can bind values, class definitions,
and provider functions to those contexts and then resolve the values (or the
results of functions that return those values!) in other areas of your code.

{% include code-caption.html content="src/application.ts" %}

```ts
import {Application} from '@loopback/core';
import * as fs from 'fs-extra';
import * as path from 'path';

export class MyApp extends RestApplication {
  constructor() {
    super();
    const app = this;
    const widgetConf = JSON.parse(
      fs.readFileSync(path.resolve('widget-config.json')).toString(),
    );
    function logInfo(info: string) {
      console.log(info);
    }
    app.bind('config.widget').to(widgetConf);
    app.bind('logger.widget').to(logInfo);
  }
}
```

Now that we've bound the 'config.widget' key to our configuration object, and
the 'logger.widget' key to the function `logInfo()`, we can inject them in our
WidgetController:

{% include code-caption.html content="src/controllers/widget.controller.ts" %}

```ts
import {inject} from '@loopback/context';

export class WidgetController {
  // injection for property
  @inject('logger.widget')
  private logger: Function;

  // injection for constructor parameter
  constructor(
    @inject('config.widget') protected widget: any, // This will be resolved at runtime!
  ) {}
  // etc...
}
```

The `@inject` decorator now also accepts a binding filter function so that an
array of values can be injected. If the target type is not `Array`, an error
will be thrown.

```ts
class MyControllerWithValues {
  constructor(
    @inject(binding => binding.tagNames.includes('foo'))
    public values: string[],
  ) {}
}
```

To sort matched bindings found by the binding filter function, `@inject` honors
`bindingComparator` in `metadata`:

```ts
class MyControllerWithValues {
  constructor(
    @inject(binding => binding.tagNames.includes('foo'), {
      bindingComparator: (a, b) => {
        // Sort by value of `foo` tag
        return a.tagMap.foo.localeCompare(b.tagMap.foo);
      },
    })
    public values: string[],
  ) {}
}
```

A few variants of `@inject` are provided to declare special forms of
dependencies.

### @inject.getter

`@inject.getter` injects a getter function that returns a promise of the bound
value of the key.

Syntax: `@inject.getter(bindingSelector: BindingSelector)`.

```ts
import {inject, Getter} from '@loopback/context';
import {UserProfile} from '@loopback/authentication';
import {get} from '@loopback/rest';

export class HelloController {
  constructor(
    @inject.getter('authentication.currentUser')
    private userGetter: Getter<UserProfile>,
  ) {}

  @get('/hello')
  async greet() {
    const user = await this.userGetter();
    return `Hello, ${user.name}`;
  }
}
```

`@inject.getter` also allows the getter function to return an array of values
from bindings that match a filter function.

```ts
class MyControllerWithGetter {
  @inject.getter(filterByTag('prime'))
  getter: Getter<number[]>;
}
```

### @inject.setter

`@inject.setter` injects a setter function to set the bound value of the key.

Syntax: `@inject.setter(bindingKey: BindingAddress, {bindingCreation?: ...})`.

The `setter` function injected has the following signature:

```ts
export type Setter<T> = (value?: T) => void;
```

The binding resolution/creation is controlled by `bindingCreation` option. See
[@inject.binding](#injectbinding) for possible settings.

The following example shows the usage of `@inject.setter` and the injected
setter function.

```ts
export class HelloController {
  constructor(
    @inject.setter('greeting') private greetingSetter: Setter<string>,
  ) {}

  @get('/hello')
  greet() {
    const defaultGreet = 'Greetings!';
    this.greetingSetter(defaultGreet); // key 'greeting' is now bound to 'Greetings!'
    return defaultGreet;
  }
}
```

Please note the setter function simply binds a `value` to the underlying binding
using `binding.to(value)`.

To set other types of value providers such as `toDynamicValue`or `toClass`, use
`@inject.binding` instead.

### @inject.binding

`@inject.binding` injects a binding for the given key. It can be used to bind
various types of value providers to the underlying binding or configure the
binding. This is an advanced form of `@inject.setter`, which only allows to set
a constant value (using `Binding.to(value)` behind the scene) to the underlying
binding.

Syntax: `@inject.binding(bindingKey: BindingAddress, {bindingCreation?: ...})`.

```ts
export class HelloController {
  constructor(
    @inject.binding('greeting') private greetingBinding: Binding<string>,
  ) {}

  @get('/hello')
  async greet() {
    // Bind `greeting` to a factory function that reads default greeting
    // from a file or database
    this.greetingBinding.toDynamicValue(() => readDefaultGreeting());
    return this.greetingBinding.get<string>(this.greetingBinding.key);
  }
}
```

The `@inject.binding` takes an optional `metadata` object which can contain
`bindingCreation` to control how underlying binding is resolved or created based
on the following values:

```ts
/**
 * Policy to control if a binding should be created for the context
 */
export enum BindingCreationPolicy {
  /**
   * Always create a binding with the key for the context
   */
  ALWAYS_CREATE = 'Always',
  /**
   * Never create a binding for the context. If the key is not bound in the
   * context, throw an error.
   */
  NEVER_CREATE = 'Never',
  /**
   * Create a binding if the key is not bound in the context. Otherwise, return
   * the existing binding.
   */
  CREATE_IF_NOT_BOUND = 'IfNotBound',
}
```

For example:

```ts
@inject.setter('binding-key', {bindingCreation: BindingCreationPolicy.NEVER_CREATES})
```

### @inject.tag

`@inject.tag` injects an array of values by a pattern or regexp to match binding
tags.

Syntax: `@inject.tag(tag: BindingTag | RegExp)`.

```ts
class Store {
  constructor(@inject.tag('store:location') public locations: string[]) {}
}

const ctx = new Context();
ctx.bind('store').toClass(Store);
ctx
  .bind('store.locations.sf')
  .to('San Francisco')
  .tag('store:location');
ctx
  .bind('store.locations.sj')
  .to('San Jose')
  .tag('store:location');
const store = ctx.getSync<Store>('store');
console.log(store.locations); // ['San Francisco', 'San Jose']
```

### @inject.view

`@inject.view` injects a `ContextView` to track a list of bound values matching
a filter function.

```ts
import {inject} from '@loopback/context';
import {DataSource} from '@loopback/repository';

export class DataSourceTracker {
  constructor(
    @inject.view(filterByTag('datasource'))
    private dataSources: ContextView<DataSource[]>,
  ) {}

  async listDataSources(): Promise<DataSource[]> {
    // Use the Getter function to resolve data source instances
    return this.dataSources.values();
  }
}
```

In the example above, `filterByTag` is a helper function that creates a filter
function that matches a given tag. You can define your own filter functions,
such as:

```ts
export class DataSourceTracker {
  constructor(
    @inject.view(binding => binding.tagNames.includes('datasource'))
    private dataSources: ContextView<DataSource[]>,
  ) {}
}
```

The `@inject.view` decorator takes a `BindingFilter` function. It can only be
applied to a property or method parameter of `ContextView` type.

### @inject.context

`@inject.context` injects the current context.

Syntax: `@inject.context()`.

```ts
class MyComponent {
  constructor(@inject.context() public ctx: Context) {}
}

const ctx = new Context();
ctx.bind('my-component').toClass(MyComponent);
const component = ctx.getSync<MyComponent>('my-component');
// `component.ctx` should be the same as `ctx`
```

**NOTE**: It's recommended to use `@inject` with specific keys for dependency
injection if possible. Use `@inject.context` only when the code needs to access
the current context object for advanced use cases.

For more information, see the [Dependency Injection](Dependency-injection.md)
section under [LoopBack Core Concepts](Concepts.md).
