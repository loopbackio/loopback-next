// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor} from '@loopback/core';
import {GrpcObject, MethodDefinition, ServiceDefinition} from 'grpc';
import {GrpcSequenceHandler} from './grpc.sequence';

/**
 * Configuration for a GRPC server
 */
export interface GrpcServerConfig {
  host?: string;
  port?: number;
  sequence?: Constructor<GrpcSequenceHandler>;
}

export interface GrpcMethod {
  PROTO_NAME: string;
  PROTO_PACKAGE: string;
  SERVICE_NAME: string;
  METHOD_NAME: string;
  REQUEST_STREAM: boolean;
  RESPONSE_STREAM: boolean;
}

/**
 * Metadata for a GRPC method
 */
export interface GrpcMethodMetadata {
  // <packageName>.<ServiceName>/<MethodName>, such as "greeterpackage.Greeter/SayHello"
  path: string;
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
