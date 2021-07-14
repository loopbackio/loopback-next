# @loopback/rest

The REST API package for
[loopback-next](https://github.com/loopbackio/loopback-next).

## Overview

This component provides a REST server for your application instances, complete
with:

- new custom routing engine (special thanks to @bajtos)!
- tools for defining your application routes
- OpenAPI 3.0 spec (`openapi.json`/`openapi.yaml`) generation using
  `@loopback/openapi-v3`
- a default sequence implementation to manage the request and response lifecycle

**NOTE: Starting from 6.0.0, we have introduced a middleware-based sequence,
which is is used as the default one for newly generated LoopBack applications
using `lb4` command from `@loopback/cli`.**

## Installation

To use this package, you'll need to install `@loopback/rest`.

```sh
npm i @loopback/rest
```

## Basic Use

Here's a basic "Hello World" application using `@loopback/rest`:

```ts
import {RestApplication, RestServer} from '@loopback/rest';

const app = new RestApplication();
app.handler(({request, response}, sequence) => {
  sequence.send(response, 'hello world');
});

(async function start() {
  await app.start();

  const server = await app.getServer(RestServer);
  const port = await server.get('rest.port');
  console.log(`Server is running at http://127.0.0.1:${port}`);
})();
```

## Configuration

See https://loopback.io/doc/en/lb4/Server.html#configuration.

## Contributions

- [Guidelines](https://github.com/loopbackio/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/loopbackio/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/loopbackio/loopback-next/graphs/contributors).

## License

MIT
