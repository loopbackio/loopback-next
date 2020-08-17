// package: greeterpackage
// file: greeter.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from 'google-protobuf';

export class HelloRequest extends jspb.Message {
  getName(): string;
  setName(value: string): HelloRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HelloRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: HelloRequest,
  ): HelloRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: HelloRequest,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): HelloRequest;
  static deserializeBinaryFromReader(
    message: HelloRequest,
    reader: jspb.BinaryReader,
  ): HelloRequest;
}

export namespace HelloRequest {
  export type AsObject = {
    name: string;
  };
}

export class HelloReply extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): HelloReply;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HelloReply.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: HelloReply,
  ): HelloReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: HelloReply,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): HelloReply;
  static deserializeBinaryFromReader(
    message: HelloReply,
    reader: jspb.BinaryReader,
  ): HelloReply;
}

export namespace HelloReply {
  export type AsObject = {
    message: string;
  };
}

export class TestRequest extends jspb.Message {
  getName(): string;
  setName(value: string): TestRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TestRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: TestRequest,
  ): TestRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: TestRequest,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): TestRequest;
  static deserializeBinaryFromReader(
    message: TestRequest,
    reader: jspb.BinaryReader,
  ): TestRequest;
}

export namespace TestRequest {
  export type AsObject = {
    name: string;
  };
}

export class TestReply extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): TestReply;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TestReply.AsObject;
  static toObject(includeInstance: boolean, msg: TestReply): TestReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: TestReply,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): TestReply;
  static deserializeBinaryFromReader(
    message: TestReply,
    reader: jspb.BinaryReader,
  ): TestReply;
}

export namespace TestReply {
  export type AsObject = {
    message: string;
  };
}
