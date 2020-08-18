// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// package: greeterpackage
// file: greeter.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from 'grpc';
import * as greeter_pb from './greeter_pb';

interface IGreeterService
  extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  sayHello: IGreeterService_ISayHello;
  sayTest: IGreeterService_ISayTest;
}

interface IGreeterService_ISayHello
  extends grpc.MethodDefinition<
    greeter_pb.HelloRequest,
    greeter_pb.HelloReply
  > {
  path: string; // "/greeterpackage.Greeter/SayHello"
  requestStream: false;
  responseStream: false;
  requestSerialize: grpc.serialize<greeter_pb.HelloRequest>;
  requestDeserialize: grpc.deserialize<greeter_pb.HelloRequest>;
  responseSerialize: grpc.serialize<greeter_pb.HelloReply>;
  responseDeserialize: grpc.deserialize<greeter_pb.HelloReply>;
}
interface IGreeterService_ISayTest
  extends grpc.MethodDefinition<greeter_pb.TestRequest, greeter_pb.TestReply> {
  path: string; // "/greeterpackage.Greeter/SayTest"
  requestStream: false;
  responseStream: false;
  requestSerialize: grpc.serialize<greeter_pb.TestRequest>;
  requestDeserialize: grpc.deserialize<greeter_pb.TestRequest>;
  responseSerialize: grpc.serialize<greeter_pb.TestReply>;
  responseDeserialize: grpc.deserialize<greeter_pb.TestReply>;
}

export const GreeterService: IGreeterService;

export interface IGreeterServer {
  sayHello: grpc.handleUnaryCall<
    greeter_pb.HelloRequest,
    greeter_pb.HelloReply
  >;
  sayTest: grpc.handleUnaryCall<greeter_pb.TestRequest, greeter_pb.TestReply>;
}

export interface IGreeterClient {
  sayHello(
    request: greeter_pb.HelloRequest,
    callback: (
      error: grpc.ServiceError | null,
      response: greeter_pb.HelloReply,
    ) => void,
  ): grpc.ClientUnaryCall;
  sayHello(
    request: greeter_pb.HelloRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: greeter_pb.HelloReply,
    ) => void,
  ): grpc.ClientUnaryCall;
  sayHello(
    request: greeter_pb.HelloRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (
      error: grpc.ServiceError | null,
      response: greeter_pb.HelloReply,
    ) => void,
  ): grpc.ClientUnaryCall;
  sayTest(
    request: greeter_pb.TestRequest,
    callback: (
      error: grpc.ServiceError | null,
      response: greeter_pb.TestReply,
    ) => void,
  ): grpc.ClientUnaryCall;
  sayTest(
    request: greeter_pb.TestRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: greeter_pb.TestReply,
    ) => void,
  ): grpc.ClientUnaryCall;
  sayTest(
    request: greeter_pb.TestRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (
      error: grpc.ServiceError | null,
      response: greeter_pb.TestReply,
    ) => void,
  ): grpc.ClientUnaryCall;
}

export class GreeterClient extends grpc.Client implements IGreeterClient {
  constructor(
    address: string,
    credentials: grpc.ChannelCredentials,
    options?: object,
  );
  public sayHello(
    request: greeter_pb.HelloRequest,
    callback: (
      error: grpc.ServiceError | null,
      response: greeter_pb.HelloReply,
    ) => void,
  ): grpc.ClientUnaryCall;
  public sayHello(
    request: greeter_pb.HelloRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: greeter_pb.HelloReply,
    ) => void,
  ): grpc.ClientUnaryCall;
  public sayHello(
    request: greeter_pb.HelloRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (
      error: grpc.ServiceError | null,
      response: greeter_pb.HelloReply,
    ) => void,
  ): grpc.ClientUnaryCall;
  public sayTest(
    request: greeter_pb.TestRequest,
    callback: (
      error: grpc.ServiceError | null,
      response: greeter_pb.TestReply,
    ) => void,
  ): grpc.ClientUnaryCall;
  public sayTest(
    request: greeter_pb.TestRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: greeter_pb.TestReply,
    ) => void,
  ): grpc.ClientUnaryCall;
  public sayTest(
    request: greeter_pb.TestRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (
      error: grpc.ServiceError | null,
      response: greeter_pb.TestReply,
    ) => void,
  ): grpc.ClientUnaryCall;
}
