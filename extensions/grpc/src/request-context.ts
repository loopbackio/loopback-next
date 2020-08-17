// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/core';
import {
  ServerDuplexStream,
  ServerReadableStream,
  ServerUnaryCall,
  ServerWritableStream,
} from 'grpc';
import {GrpcOperation} from './types';

export class GrpcRequestContext<Req = unknown, Res = unknown> extends Context {
  path: string;
  operation: GrpcOperation;
  request:
    | ServerUnaryCall<Req>
    | ServerReadableStream<Req>
    | ServerWritableStream<Req>
    | ServerDuplexStream<Req, Res>;
  response?: Res;

  constructor(
    operation: GrpcOperation,
    request:
      | ServerUnaryCall<Req>
      | ServerReadableStream<Req>
      | ServerWritableStream<Req>
      | ServerDuplexStream<Req, Res>,
    parent?: Context,
  ) {
    super(parent);
    this.operation = operation;
    this.request = request;
  }
}
