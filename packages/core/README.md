# @loopback/core

LoopBack makes it easy to build modern applications that require complex
integrations.

## Overview

- Fast, small, powerful, extensible core
- Generate real APIs with a single command
- Define your data and endpoints with OpenAPI
- No maintenance of generated code

## Installation

```shell
$ npm install --save @loopback/core
```

## Basic Use

`@loopback/core` provides the foundation for your LoopBack app, but unlike
previous versions, it no longer contains the implementation for listening
servers.

For a typical example of how to create a REST server with your application, see
the
[@loopback/rest package.](https://github.com/strongloop/loopback-next/tree/master/packages/rest)

## Advanced Use

Since `@loopback/core` is decoupled from the listening server implementation,
LoopBack applications are now able to work with any component that provides this
functionality.

```ts
// index.ts
import {Application} from '@loopback/core';
import {RestComponent} from '@loopback/rest';
import {GrpcComponent} from '@loopback/grpc';

const app = new Application({
  rest: {
    port: 3000,
  },
  grpc: {
    port: 3001,
  },
});
app.component(RestComponent); // REST Server
app.component(GrpcComponent)(
  // GRPC Server

  async function start() {
    // Let's retrieve the bound instances of our servers.
    const rest = await app.getServer<RestServer>('RestServer');
    const grpc = await app.getServer<GrpcServer>('GrpcServer');

    // Define all sorts of bindings here to pass configuration or data
    // between your server instances, define controllers and datasources for them,
    // etc...
    await app.start(); // This automatically spins up all your servers, too!
    console.log(`REST server running on port: ${rest.getSync('rest.port')}`);
    console.log(`GRPC server running on port: ${grpc.getSync('grpc.port')}`);
  },
)();
```

In the above example, having a GRPC server mounted on your Application could
enable communication with other GRPC-enabled microservices, allowing things like
dynamic configuration updates.

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
