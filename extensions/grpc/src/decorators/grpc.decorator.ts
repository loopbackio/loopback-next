// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MethodDecoratorFactory} from '@loopback/core';
import {GrpcMethodMetadata} from '../types';

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
 * class GreeterController implements Greeter.Service {
 *   @grpc('greeterpackage.Greeter/SayHello')
 *   public sayHello(request: HelloRequest): HelloResponse {
 *     return { message: 'Hello ' + call.request.name };
 *   }
 * }
 * ```
 */
export function grpc(spec: GrpcMethodMetadata | string) {
  let metadata: GrpcMethodMetadata;
  if (isGrpcMethodMetadata(spec)) {
    metadata = spec;
    if (metadata.packageName && metadata.serviceName && metadata.methodName) {
      metadata.path = `${metadata.packageName}.${metadata.serviceName}/${metadata.methodName}`;
    }
  } else {
    metadata = {path: spec};
  }
  return MethodDecoratorFactory.createDecorator(GRPC_METHODS, metadata);
}

function isGrpcMethodMetadata(
  spec: GrpcMethodMetadata | string,
): spec is GrpcMethodMetadata {
  return typeof (spec as GrpcMethodMetadata).path === 'string';
}
