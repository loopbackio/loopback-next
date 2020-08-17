// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey, Context, CoreBindings} from '@loopback/core';
import {Server} from 'grpc';
import {GrpcSequenceHandler} from './grpc.sequence';

/**
 * Binding keys used by this component.
 */
export namespace GrpcBindings {
  export const GRPC_SERVER = BindingKey.create<Server>('grpc.server');
  export const GRPC_SEQUENCE = BindingKey.create<GrpcSequenceHandler>(
    'grpc.sequence',
  );
  export const GRPC_CONTROLLER = 'grpc.controller';
  export const GRPC_METHOD = 'grpc.method';
  export const GRPC_METHOD_NAME = BindingKey.create<string>('grpc.method.name');
  export const GRPC_GENERATOR = 'grpc.generator';
  export const CONTEXT = BindingKey.create<Context>('grpc.context');
  export const HOST = BindingKey.create<string | undefined>('grpc.host');
  export const PORT = BindingKey.create<number | undefined>('grpc.port');
  export const CONFIG = `${CoreBindings.APPLICATION_CONFIG}#grpc`;
}
