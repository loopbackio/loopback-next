// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export namespace Greeter {
  /**
   * Greeter interface that provides types
   * for methods from the given gRPC Greeter Service.
   */
  export interface Service {
    /**
     * Greeter method declaration
     * from the given gRPC Greeter service.
     */
    sayHello(request: HelloRequest): HelloReply;
    /**
     * Greeter method declaration
     * from the given gRPC Greeter service.
     */
    sayTest(request: TestRequest): TestReply;
  }
  /**
   * Greeter method configuration
   * from the given gRPC Greeter service.
   */
  export namespace SayHello {
    export const PROTO_NAME = 'greeter.proto';
    export const PROTO_PACKAGE = 'greeterpackage';
    export const SERVICE_NAME = 'Greeter';
    export const METHOD_NAME = 'SayHello';
    export const REQUEST_STREAM = false;
    export const RESPONSE_STREAM = false;
  }
  /**
   * Greeter method configuration
   * from the given gRPC Greeter service.
   */
  export namespace SayTest {
    export const PROTO_NAME = 'greeter.proto';
    export const PROTO_PACKAGE = 'greeterpackage';
    export const SERVICE_NAME = 'Greeter';
    export const METHOD_NAME = 'SayTest';
    export const REQUEST_STREAM = false;
    export const RESPONSE_STREAM = false;
  }
}

/**
 * HelloRequest interface that provides properties
 * and typings from the given gRPC HelloRequest Message.
 */
export interface HelloRequest {
  name: string;
}

/**
 * HelloReply interface that provides properties
 * and typings from the given gRPC HelloReply Message.
 */
export interface HelloReply {
  message: string;
}

/**
 * TestRequest interface that provides properties
 * and typings from the given gRPC TestRequest Message.
 */
export interface TestRequest {
  name: string;
}

/**
 * TestReply interface that provides properties
 * and typings from the given gRPC TestReply Message.
 */
export interface TestReply {
  message: string;
}
