// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {GrpcObject, MethodDefinition, ServiceDefinition} from '@grpc/grpc-js';
import {ContextView, filterByTag, inject} from '@loopback/core';
import debugFactory from 'debug';
import {GrpcBindings, GrpcTags} from './keys';
import {GrpcOperation, GrpcServerConfig} from './types';
const debug = debugFactory('loopback:grpc:proto');

/**
 * Managing proto files
 */
export class ProtoManager {
  /**
   * proto instances directory loaded during
   * boot time and later being used by implemented grpc
   * controllers.
   */
  private protos?: Record<string, GrpcOperation>;

  /**
   * @param - config
   */
  constructor(
    @inject(GrpcBindings.CONFIG) protected config: GrpcServerConfig,
    @inject.view(filterByTag(GrpcTags.PROTO))
    protected protosView: ContextView<GrpcObject>,
  ) {
    this.protosView.on('refresh', () => (this.protos = undefined));
  }

  indexProtos() {
    if (this.protos != null) return;
    this.protos = {};
    const protoBindings = this.protosView.bindings;
    for (const protoBinding of protoBindings) {
      const protoObj = this.protosView.context.getSync<GrpcObject>(
        protoBinding.key,
      );

      for (const pkg in protoObj) {
        const pkgObj = protoObj[pkg] as GrpcObject;
        debug('Protobuf packge: %s', pkg, pkgObj);
        for (const key in pkgObj) {
          const child = pkgObj[key] as GrpcObject;
          if (child.service) {
            const service = (child.service as unknown) as ServiceDefinition<
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              any
            >;
            debug('Protobuf service: %s', key, service);
            for (const m in service) {
              const method = service[m] as MethodDefinition<unknown, unknown>;
              const methodPath = (method.path as unknown) as string;
              debug('Protobuf method: %s', m, method);
              this.protos[methodPath] = {
                package: pkgObj,
                service,
                method,
                path: methodPath,
                name: m,
              };
            }
          }
        }
      }
    }
  }

  /**
   * This method will return a proto operation for the given path
   *
   * @param methodPath - Path for the gRPC method <package>.<Service>/<Method>
   *
   */
  public getProto(methodPath: string): GrpcOperation | undefined {
    this.indexProtos();
    return this.protos == null ? undefined : this.protos[`/${methodPath}`];
  }
}
