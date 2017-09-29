# @loopback/rest

The REST API package for [loopback-next](https://github.com/strongloop/loopback-next).

## STATUS: ALPHA
This package is not yet ready for production use, and the API has not yet
stabilized. Additionally, this document is also a work-in-progress and some
sections may not have corresponding code!

## Overview
This component provides a REST server for your application instances, complete
with:
- new custom routing engine (special thanks to @bajtos)!
- tools for defining your application routes
- OpenAPI 2.0 spec (`swagger.json`/`swagger.yaml`) generation
- a default sequence implementation to manage the request and response lifecycle
## Installation
To use this package, you'll need to install both `@loopback/core` and
`@loopback/rest`.

```shell
$ npm install --save @loopback/core @loopback/rest
```

## Basic Use
Here's a basic "Hello World" application using `@loopback/core` and
`@loopback/rest`:

  ```ts
  import {Application} from '@loopback/core';
  import {RestComponent, RestServer} from '@loopback/rest';

  const app = new Application({
    components: [
      RestComponent,
    ]
  });

  (async function start() {
    const rest = await app.getServer(RestServer);
    rest.handler((sequence, request, response) => {
      sequence.send(response, 'hello world');
    });
    await app.start();
    console.log(`REST server running on port: ${rest.getSync('rest.port')}`);
  })();
  ```

## Configuration
The rest package is configured by passing a `rest` property inside of your
Application options.

```ts
  const app = new Application({
    components: [
      RestComponent,
    ],
    rest: {
      port: 3001
    }
  });
```

### `rest` options

| Property | Type | Purpose |
|----------|------|---------|
| port | number | Specify the port on which the RestServer will listen for traffic. |
| secure (NOT YET IMPLEMENTED) | HttpsConfiguration | Provide a collection of secure key materials to the RestServer, which switches it to HTTPS mode. |
| sequence | SequenceHandler | Use a custom SequenceHandler to change the behaviour of the RestServer for the request-response lifecycle. |

#### HttpsConfiguration
<!-- TODO(@kjdelisle): Define the contents of this type for users. -->

#### SequenceHandler
<!-- TODO(@kjdelisle): Point to the request-response lifecycle doc
(or migrate it here?) -->

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/wiki/Contributing#guidelines)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See [all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
