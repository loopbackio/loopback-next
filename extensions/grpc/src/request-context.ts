// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ServerDuplexStream,
  ServerReadableStream,
  ServerUnaryCall,
  ServerWritableStream,
} from '@grpc/grpc-js';
import {Context} from '@loopback/core';
import {GrpcOperation} from './types';

export type GrpcRequest<Req = unknown, Res = unknown> =
  | ServerUnaryCall<Req, Res>
  | ServerReadableStream<Req, Res>
  | ServerWritableStream<Req, Res>
  | ServerDuplexStream<Req, Res>;

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
  request: GrpcRequest<Req, Res>;

  /**
   * Response type
   */
  response?: Res;

  constructor(
    operation: GrpcOperation,
    request: GrpcRequest<Req, Res>,
    parent?: Context,
  ) {
    super(parent);
    this.operation = operation;
    this.request = request;
  }
}
