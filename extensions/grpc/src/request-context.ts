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

/**
 * Context for gRPC request/response processing
 */
export class GrpcRequestContext<Req = unknown, Res = unknown> extends Context {
  /**
   * gRPC operation spec
   */
  operation: GrpcOperation;

  /**
   * Request object
   */
  request:
    | ServerUnaryCall<Req>
    | ServerReadableStream<Req>
    | ServerWritableStream<Req>
    | ServerDuplexStream<Req, Res>;

  /**
   * Response type
   */
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
