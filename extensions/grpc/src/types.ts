// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {GrpcObject, MethodDefinition, ServiceDefinition} from '@grpc/grpc-js';
import {
  Constructor,
  GenericInterceptor,
  GenericInterceptorChain,
} from '@loopback/core';
import {GrpcSequenceHandler} from './grpc.sequence';
import {GrpcRequestContext} from './request-context';

/**
 * Configuration for a GRPC server
 */
export interface GrpcServerConfig {
  host?: string;
  port?: number;
  sequence?: Constructor<GrpcSequenceHandler>;
}

/**
 * Metadata for a GRPC method
 */
export interface GrpcMethodMetadata {
  // <packageName>.<ServiceName>/<MethodName>, such as "greeterpackage.Greeter/SayHello"
  path: string;
  packageName?: string;
  serviceName?: string;
  methodName?: string;
  requestStream?: boolean;
  responseStream?: boolean;
}

/**
 * Loaded proto object for GRPC
 */
export interface GrpcProto {
  name: string;
  file: string;
  proto: GrpcObject;
}

export interface GrpcOperation {
  package: GrpcObject;
  service: ServiceDefinition<unknown>;
  method: MethodDefinition<unknown, unknown>;
  name: string;
  path: string;
}

export interface GrpcMiddleware
  extends GenericInterceptor<GrpcRequestContext> {}

export class GrpcMiddlewareChain extends GenericInterceptorChain<
  GrpcRequestContext
> {}
