---
lang: en
title: 'Dependency Injection Decorators'
keywords: LoopBack 4.0, LoopBack-Next
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Decorators_inject.html
---

## Dependency Injection Decorator

`@inject` is a decorator to annotate class properties or constructor arguments
for automatic injection by LoopBack's IoC container.

The injected values are applied to a constructed instance, so it can only be
used on non-static properties or constructor parameters of a Class.

The `@inject` decorator allows you to inject dependencies bound to any
implementation of the [Context](Context.md) object, such as an Application
instance or a request context instance. You can bind values, class definitions,
and provider functions to those contexts and then resolve the values (or the
results of functions that return those values!) in other areas of your code.

```ts
// src/application.ts
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

```ts
// src/controllers/widget.controller.ts
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

A few variants of `@inject` are provided to declare special forms of
dependencies:

- `@inject.getter`: inject a getter function that returns a promise of the bound
  value of the key

Syntax: `@inject.getter(bindingKey: string)`.

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

- `@inject.setter`: inject a setter function to set the bound value of the key

Syntax: `@inject.setter(bindingKey: string)`.

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

- `@inject.tag`: inject an array of values by a pattern or regexp to match
  binding tags

Syntax: `@inject.tag(tag: string | RegExp)`.

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

- `@inject.context`: inject the current context

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

For more information, see the [Dependency Injection](Dependency-Injection.md)
section under [LoopBack Core Concepts](Concepts.md)
