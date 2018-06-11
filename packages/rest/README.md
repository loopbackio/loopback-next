# @loopback/rest

The REST API package for
[loopback-next](https://github.com/strongloop/loopback-next).

## Overview

This component provides a REST server for your application instances, complete
with:

- new custom routing engine (special thanks to @bajtos)!
- tools for defining your application routes
- OpenAPI 3.0 spec (`openapi.json`/`openapi.yaml`) generation using
  `@loopback/openapi-v3`
- a default sequence implementation to manage the request and response lifecycle

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

  const rest = await app.getServer(RestServer);
  const port = await server.get('rest.port');
  console.log(`Server is running at http://127.0.0.1:${port}`);
})();
```

## Configuration

The rest package is configured by passing a `rest` property inside of your
Application options.

```ts
const app = new RestApplication({
  rest: {
    port: 3001,
  },
});
```

### `rest` options

| Property | Type            | Purpose                                                                                                   |
| -------- | --------------- | --------------------------------------------------------------------------------------------------------- |
| port     | number          | Specify the port on which the RestServer will listen for traffic.                                         |
| sequence | SequenceHandler | Use a custom SequenceHandler to change the behavior of the RestServer for the request-response lifecycle. |

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
