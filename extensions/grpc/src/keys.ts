// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Server} from '@grpc/grpc-js';
import {BindingKey, Context, CoreBindings} from '@loopback/core';
import {GrpcSequenceHandler} from './grpc.sequence';
import {GrpcMiddleware} from './types';

/**
 * Binding keys used by this component.
 */
export namespace GrpcBindings {
  export const GRPC_SERVER = BindingKey.create<Server>('grpc.server');
  export const GRPC_SEQUENCE = BindingKey.create<GrpcSequenceHandler>(
    'grpc.sequence',
  );
  export const GRPC_METHOD_INVOKER = BindingKey.create<GrpcMiddleware>(
    'grpc.middleware.invokeMethod',
  );
  export const GRPC_CONTROLLER = 'grpc.controller';
  export const GRPC_METHOD = 'grpc.method';
  export const GRPC_METHOD_NAME = BindingKey.create<string>('grpc.method.name');
  export const GRPC_PROTO_MANAGER = 'grpc.protoManager';
  export const CONTEXT = BindingKey.create<Context>('grpc.context');
  export const HOST = BindingKey.create<string | undefined>('grpc.host');
  export const PORT = BindingKey.create<number | undefined>('grpc.port');
  export const CONFIG = `${CoreBindings.APPLICATION_CONFIG}#grpc`;
}

export namespace GrpcTags {
  export const PROTO = 'grpcProto';
  export const MIDDLEWARE = 'grpcMiddleware';
}
