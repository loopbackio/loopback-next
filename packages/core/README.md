# @loopback.core

LoopBack makes it easy to build modern applications that require complex
integrations.

# Overview

- Fast, small, powerful, extensible core
- Generate real APIs with a single command
- Define your data and endpoints with OpenAPI
- No maintenance of generated code


## Installation

```shell
$ npm install --save @loopback/core
```

## Basic use

  ```ts
  import {Application} from '@loopback/core';

  const app = new Application();
  app.handler((sequence, request, response) => {
    sequence.send(response, 'hello world'));
  });

  (async function start() {
    await app.start();
    console.log(`The app is running on port ${app.getSync('http.port')}`);
  })();
  ```

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/wiki/Contributing#guidelines)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See [all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
