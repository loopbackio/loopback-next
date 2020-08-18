// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  bind,
  BindingScope,
  ContextTags,
  invokeMethod,
  Provider,
} from '@loopback/core';
import debugFactory from 'debug';
import {ServerUnaryCall} from 'grpc';
import {GrpcBindings, GrpcTags} from '../keys';
import {GrpcRequestContext} from '../request-context';
import {GrpcMiddleware} from '../types';

const debug = debugFactory('loopback:grpc:middleware:invoke-method');

/**
 * gRPC method invoker middleware
 */
@bind({
  tags: {
    [GrpcTags.MIDDLEWARE]: GrpcTags.MIDDLEWARE,
    [ContextTags.KEY]: GrpcBindings.GRPC_METHOD_INVOKER,
  },
  scope: BindingScope.SINGLETON,
})
export class GrpcMethodInvokerProvider implements Provider<GrpcMiddleware> {
  constructor() {}

  async invoke<Req = unknown, Res = unknown>(
    reqCtx: GrpcRequestContext<Req, Res>,
    input?: Req,
  ) {
    const controller: {[method: string]: Function} = await reqCtx.get(
      GrpcBindings.GRPC_CONTROLLER,
    );
    const method = await reqCtx.get(GrpcBindings.GRPC_METHOD_NAME);
    // Do something before call
    debug('Calling %s.%s', controller.constructor.name, method, reqCtx);
    return invokeMethod(controller, method, reqCtx, [input ?? reqCtx]);
  }

  async action<Req = unknown, Res = unknown>(
    reqCtx: GrpcRequestContext<Req, Res>,
  ): Promise<Res | void> {
    const method = reqCtx.operation.method;
    if (method.requestStream === true && method.responseStream === true) {
      return this.invoke(reqCtx);
    } else if (
      method.requestStream === true &&
      method.responseStream === false
    ) {
      return this.invoke(reqCtx);
    } else if (
      method.requestStream === false &&
      method.responseStream === true
    ) {
      return this.invoke(reqCtx);
    } else if (
      method.requestStream === false &&
      method.responseStream === false
    ) {
      return this.invoke(
        reqCtx,
        (reqCtx.request as ServerUnaryCall<Req>).request,
      );
    }
  }

  value() {
    return this.action.bind(this);
  }
}
