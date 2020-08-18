// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ContextView, filterByTag, inject} from '@loopback/core';
import {execSync} from 'child_process';
import debugFactory from 'debug';
import {GrpcObject, MethodDefinition, ServiceDefinition} from 'grpc';
import path from 'path';
import {GrpcBindings, GrpcTags} from './keys';
import {GrpcOperation, GrpcServerConfig} from './types';
const debug = debugFactory('loopback:grpc:generator');

/**
 * GRPC TypeScript generator.
 * This class will iterate over a directory generating
 * corresponding typescript files from proto files.
 * Required for `@grpc` configuration and strict development.
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
  /**
   * This method will find and load all protos
   * contained within the project directory. Saving in memory
   * instances for those found protos for later usage.
   */
  generateTsCode() {
    const protoBindings = this.protosView.bindings;
    for (const protoBinding of protoBindings) {
      if (protoBinding.tagMap.file != null) {
        this.generate(protoBinding.tagMap.file);
      }
    }
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const service = child.service as ServiceDefinition<any>;
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

  /**
   * This method will generate a typescript
   * file representing the provided proto file by calling
   * google's proto compiler and using `@mean-experts`'s
   * protoc-ts plugin.
   * @param proto
   *
   */
  private generate(proto: string): Buffer {
    const root = path.dirname(proto);
    const isWin = process.platform === 'win32';
    const protocPath = path.join(
      __dirname,
      '../', // Root of grpc module and not the dist dir
      'compilers',
      process.platform,
      'bin',
      `protoc${isWin ? '.exe' : ''}`,
    );
    const pluginPath = path.normalize(
      path.join(
        process.cwd(),
        'node_modules',
        '.bin',
        `protoc-gen-ts${isWin ? '.cmd' : ''}`,
      ),
    );
    return execSync(
      `${protocPath} --plugin=protoc-gen-ts=${pluginPath} --ts_out service=true:${root} -I ${root} ${proto}`,
    );
  }
}
