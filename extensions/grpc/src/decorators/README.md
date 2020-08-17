
## Overview

Decorators provide annotations for class methods and arguments. Decorators use the form `@decorator` where `decorator` is the name of the function that will be called at runtime.

### gRPC Decorator

This decorator allows you to annotate a `Controller` class. The decorator will setup a GRPC Service.

**Example**
````js
/**
* Setup gRPC MicroService
**/
//myproject/controllers/greeter/Greeter.ts
//myproject/controllers/greeter/greeter.proto
//myproject/controllers/greeter/greeter.proto.ts
//Note: greeter.proto.ts is automatically generated from
//greeter.proto
import {grpc} from '@loopback/grpc';
import {Greeter, HelloRequest, HelloReply} from 'greeter.proto';
class GreeterCtrl implements Greeter.Service {
  @grpc(Greeter.SayHello)
  public sayHello(request: HelloRequest): HelloResponse {
    return { message: 'Hello ' + call.request.name };
  }
}
````

## Example Proto File

````proto
syntax = "proto3";
package awesomepackage;
 
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
````

## Related Resources

You can check out the following resource to learn more about decorators and how they are used in LoopBack Next.

- [TypeScript Handbook: Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [Decorators in LoopBack](http://loopback.io/doc/en/lb4/Decorators.html)
- [gRPC in NodeJS](https://grpc.io/docs/quickstart/node.html)