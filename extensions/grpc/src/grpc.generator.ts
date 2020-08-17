// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ContextView, filterByTag, inject} from '@loopback/core';
import {execSync} from 'child_process';
import {GrpcObject, MethodDefinition, ServiceDefinition} from 'grpc';
import path from 'path';
import {GrpcBindings} from './keys';
import {GrpcOperation, GrpcProto, GrpcServerConfig} from './types';

/**
 * GRPC TypeScript generator.
 * This class will iterate over a directory generating
 * corresponding typescript files from proto files.
 * Required for `@grpc` configuration and strict development.
 */
export class GrpcGenerator {
  /**
   * proto instances directory loaded during
   * boot time and later being used by implemented grpc
   * controllers.
   */
  private protos: {
    [name: string]: GrpcOperation;
  } = {};
  /**
   * @param - config
   */
  constructor(
    @inject(GrpcBindings.CONFIG) protected config: GrpcServerConfig,
    @inject.view(filterByTag('proto'))
    protected protosView: ContextView<GrpcObject>,
  ) {}
  /**
   * This method will find and load all protos
   * contained within the project directory. Saving in memory
   * instances for those found protos for later usage.
   */
  execute() {
    const protoBindings = this.protosView.bindings;
    for (const protoBinding of protoBindings) {
      const protoObj = this.protosView.context.getSync<GrpcProto>(
        protoBinding.key,
      );

      for (const pkg in protoObj.proto) {
        const pkgObj = protoObj.proto[pkg] as GrpcObject;
        for (const key in pkgObj) {
          const child = pkgObj[key] as GrpcObject;
          if (child.service) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const service = child.service as ServiceDefinition<any>;
            for (const m in service) {
              const method = service[m] as MethodDefinition<unknown, unknown>;
              const methodPath = (method.path as unknown) as string;
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
      this.generate(protoObj.file);
    }
  }

  /**
   * This method will return a proto instance
   * from the proto list directory, previously loaded during
   * boot time.
   *
   * @param methodPath
   *
   */
  public getProto(methodPath: string): GrpcOperation {
    return this.protos[`/${methodPath}`];
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
