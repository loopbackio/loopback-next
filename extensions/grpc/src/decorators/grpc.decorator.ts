// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MethodDecoratorFactory} from '@loopback/core';
import {GrpcMethod, GrpcMethodMetadata} from '../types';

export const GRPC_METHODS = 'grpc:methods';

/**
 * This decorator provides a way to configure GRPC Micro Services within LoopBack 4
 * @param spec
 *
 * @example
 *
 * myproject/controllers/greeter/Greeter.ts
 * myproject/controllers/greeter/greeter.proto
 * myproject/controllers/greeter/greeter.proto.ts
 *
 * Note: greeter.proto.ts is automatically generated from
 * greeter.proto
 *
 * ```ts
 * import {Greeter, HelloRequest, HelloReply} from 'greeter.proto';
 *
 * class GreeterCtrl implements Greeter.Service {
 *   @grpc(Greeter.SayHello)
 *   public sayHello(request: HelloRequest): HelloResponse {
 *     return { message: 'Hello ' + call.request.name };
 *   }
 * }
 * ```
 */
export function grpc(spec: GrpcMethodMetadata | GrpcMethod) {
  let metadata: GrpcMethodMetadata;
  if (isGrpcMethodMetadata(spec)) {
    metadata = spec;
  } else {
    metadata = getGrpcMethodMetadata(spec);
  }
  return MethodDecoratorFactory.createDecorator(GRPC_METHODS, metadata);
}

function isGrpcMethodMetadata(
  spec: GrpcMethodMetadata | GrpcMethod,
): spec is GrpcMethodMetadata {
  return typeof (spec as GrpcMethodMetadata).path === 'string';
}

export function getGrpcMethodMetadata(method: GrpcMethod): GrpcMethodMetadata {
  return {
    path: `${method.PROTO_PACKAGE}.${method.SERVICE_NAME}/${method.METHOD_NAME}`,
    requestStream: method.REQUEST_STREAM,
    responseStream: method.RESPONSE_STREAM,
  };
}
