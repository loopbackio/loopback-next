# @loopback/grpc

This module is a LoopBack 4 extension for creating and exposing gRPC APIs.

## Overview

The `@loopback/grpc` component enables LoopBack 4 as a [gRPC](https://grpc.io/)
Server. It also provides a gRPC decorator to define your RPC Method
implementations as controllers.

## Installation

Install the `@loopback/grpc` component in your LoopBack 4 Application.

```sh
$ npm install --save @loopback/grpc
```

## Component Configuration

```js
import {Application} from '@loopback/core';
import {GrpcComponent, Config} from '@loopback/grpc';
import {GreeterController} from './controllers/greeter.controller';
// Grpc Configurations are optional.
const config: Config.Component = {
  /* Optional Configs */
};
// Pass the optional configurations
const app = new Application({
  grpc: config,
});
// Add Grpc as Component
app.component(GrpcComponent);
// Bind GreeterCtrl to the LoopBack Application
app.controller(GreeterController);
// Start App
app.start();
```

## Discover proto files

The component contributes a booter for `.proto` files to the application. During
`app.boot()`, proto files are loaded and bound to the application context.

## Grpc Controller

The `@loopback/grpc` component provides you with a handy decorator to implement
GRPC Methods within your LoopBack controllers.

`src/controllers/greeter.controller.ts`

```ts
import {grpc} from '@loopback/grpc';
import {Greeter, HelloRequest, HelloReply} from '/greeter.proto';
export class GreeterController implements Greeter.Service {
  // Tell LoopBack that this is a Service RPC implementation
  @grpc('greeterpackage.Greeter/SayHello')
  sayHello(request: HelloRequest): HelloReply {
    const reply: HelloReply = {message: 'Hello ' + request.name};
    return reply;
  }

  @grpc('greeterpackage.Greeter/SayTest')
  sayTest(request: TestRequest): TestReply {
    return {
      message: 'Test ' + request.name,
    };
  }
}
```

## Proto Example

`protos/greeter.proto`

```txt
syntax = "proto3";
package greeterpackage;

service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message HelloReply {
  string message = 1;
}
```

## gRPC Server

## gRPC Sequence

## gRPC Middleware

## Contribute

Get started by either downloading this project or cloning it as follows:

```sh
$ git clone https://github.com/strongloop/loopback4-extension-grpc.git
$ cd loopback4-extension-grpc && npm install
```

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/wiki/Contributing#guidelines)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback4-extension-grpc/graphs/contributors).

## License

MIT
