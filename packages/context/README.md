# @loopback/context

This module provides facilities to manage artifacts and their dependencies using
`Context` in your Node.js applications. It can be used independent of the
LoopBack framework.

## Overview

The `@loopback/context` package exposes TypeScript/JavaScript APIs and
decorators to register artifacts, declare dependencies, and resolve artifacts by
keys. The `Context` also serves as an
[IoC container](https://en.wikipedia.org/wiki/Inversion_of_control) to support
[dependency injection](https://en.wikipedia.org/wiki/Dependency_injection).

`Context` and `Binding` are the two core concepts. A context is a registry of
bindings and each binding represents a resolvable artifact by the key.

- Bindings can be fulfilled by a constant, a factory function, a class, or a
  provider.
- Bindings can be grouped by tags and searched by tags.
- Binding scopes can be used to control how a resolved binding value is shared.
- Bindings can be resolved synchronously or asynchronously.
- Provide `@inject` and other variants of decorators to express dependencies.
- Support Constructor, property, and method injections.
- Allow contexts to form a hierarchy to share or override bindings.
- Track bindings and injections during resolution to detect circular
  dependencies.

## Installation

```sh
npm install --save @loopback/context
```

## Basic use

### Locate an artifact by key

```js
const Context = require('@loopback/context').Context;
const ctx = new Context();
ctx.bind('hello').to('world'); // BindingKey='hello', BindingValue='world'
const helloVal = ctx.getSync('hello');
console.log(helloVal); // => 'world'
```

The binding can also be located asynchronously:

```ts
const helloVal = await ctx.get('hello');
console.log(helloVal); // => 'world'
```

### Dependency injection using context

```ts
import {Context, inject} from '@loopback/context';
const ctx = new Context();

// bind 'greeting' to 'Hello' as the constant value
ctx.bind('greeting').to('Hello');

class HelloController {
  constructor(
    // injecting the value bound to `greeting` using context
    @inject('greeting') private greeting: string,
  ) {}

  greet(name) {
    return `${this.greeting}, ${name}`;
  }
}

// Bind 'HelloController' to class HelloController
ctx.bind('HelloController').toClass(HelloController);

async function hello() {
  // Get an instance of HelloController
  const helloController = await ctx.get<HelloController>('HelloController');
  // helloController now has the `greeting` property injected with `Hello`
  console.log(helloController.greet('John')); // => Hello, John
}

hello();
```

For additional information, please refer to the
[Context page](http://loopback.io/doc/en/lb4/Context.html).

## Examples

To learn more about advanced features, check out standalone examples at
[`@loopback/example-context`](https://github.com/strongloop/loopback-next/tree/master/examples/context).

Use the following command to download the example project to try out:

```sh
lb4 example context
```

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
