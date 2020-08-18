// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, BindingScope} from '@loopback/core';
import {GrpcTags} from './keys';
import {GrpcRequestContext} from './request-context';
import {GrpcMiddlewareChain} from './types';

/**
 *Interface for gRPC sequence
 */
export interface GrpcSequenceHandler {
  /**
   * Handle a gRPC request/response
   * @param reqCtx - gRPC request context
   */
  handle<Req = unknown, Res = unknown>(
    reqCtx: GrpcRequestContext<Req, Res>,
  ): Promise<Res | void>;
}

/**
 * GRPC Sequence
 */
@bind({scope: BindingScope.SINGLETON})
export class DefaultGrpcSequence implements GrpcSequenceHandler {
  async handle<Req = unknown, Res = unknown>(
    reqCtx: GrpcRequestContext<Req, Res>,
  ): Promise<Res | void> {
    const keys = reqCtx.findByTag(GrpcTags.MIDDLEWARE).map(b => b.key);
    const chain = new GrpcMiddlewareChain(reqCtx, keys);
    return chain.invokeInterceptors();
  }
}
