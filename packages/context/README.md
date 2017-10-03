# @loopback/context

LoopBack uses Context to manage state and dependencies in your application.

## Overview

LoopBack implements the concept of a Context to represent a global registry in your application to manage config, state, dependencies, classes, etc. Context also serves as an IoC container used to inject dependencies into your code.

## Installation

```
$ npm install --save @loopback/context
```

## Basic use
```ts
// app level
const app = new Application(); // `app` is a "Context"
app.bind('hello').to('world'); // ContextKey='hello', ContextValue='world'
console.log(app.getSync('hello')); // => 'world'
```

Dependency injection using context
```ts
const Application = require('@loopback/core');
const app = new Application();
app.bind('defaultName').to('John'); // setting context

class HelloController {
  // consider this.ctx here
  constructor(@inject('defaultName') name) { // injecting dependency using context
    this.name = name;
  }
  greet(name) {
    return `Hello ${name || this.name}`;
  }
}
```

For additional information, please refer to the [Context page](http://loopback.io/doc/en/lb4/Context.html).

## Contributions

IBM/StrongLoop is an active supporter of open source and welcomes contributions to our projects as well as those of the Node.js community in general. For more information on how to contribute please refer to the [Contribution Guide](https://loopback.io/doc/en/contrib/index.html).

## Tests

Run `npm test` from the root folder.

## Contributors

See [all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
