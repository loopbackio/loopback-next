// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MethodDecoratorFactory} from '@loopback/core';
import {GrpcMethod} from '../types';

export const GRPC_METHODS = 'grpc:methods';

/**
 * This decorator provides a way to configure GRPC Micro Services within LoopBack 4
 * @param params
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
export function grpc(spec: GrpcMethod) {
  return MethodDecoratorFactory.createDecorator(GRPC_METHODS, spec);
}
