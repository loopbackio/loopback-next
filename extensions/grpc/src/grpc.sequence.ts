// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import debugFactory from 'debug';
import {
  ServerDuplexStream,
  ServerReadableStream,
  ServerUnaryCall,
  ServerWritableStream,
} from 'grpc';
import {GrpcBindings} from './keys';

const debug = debugFactory('loopback:grpc');

/**
 * Interface that describes a GRPC Sequence
 */
export interface GrpcHandler {
  unaryCall<Req = unknown, Res = unknown>(
    request: ServerUnaryCall<Req>,
  ): Promise<Res>;

  clientStreamingCall?<Req = unknown, Res = unknown>(
    request: ServerReadableStream<Req>,
  ): Promise<Res>;

  serverStreamingCall?<Req = unknown>(
    request: ServerWritableStream<Req>,
  ): Promise<void>;

  bidiStreamingCall?<Req = unknown, Res = unknown>(
    request: ServerDuplexStream<Req, Res>,
  ): Promise<void>;
}

/**
 * GRPC Sequence
 */
export class GrpcSequence implements GrpcHandler {
  constructor(
    @inject(GrpcBindings.GRPC_CONTROLLER)
    protected controller: {[method: string]: Function},
    @inject(GrpcBindings.GRPC_METHOD_NAME) protected method: string,
  ) {}

  async unaryCall<Req = unknown, Res = unknown>(
    call: ServerUnaryCall<Req>,
  ): Promise<Res> {
    // Do something before call
    debug(
      'Calling %s.%s',
      this.controller.constructor.name,
      this.method,
      call.request,
    );
    const reply = await this.controller[this.method](call.request);
    // Do something after call
    return reply;
  }
}
