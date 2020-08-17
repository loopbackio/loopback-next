// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {execSync} from 'child_process';
import glob from 'glob';
import grpc, {GrpcObject} from 'grpc';
import path from 'path';
import {GrpcService} from './types';

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
  private protos: {[name: string]: GrpcObject} = {};
  /**
   * @param - config
   */
  constructor(protected config: GrpcService) {}
  /**
   * This method will find and load all protos
   * contained within the project directory. Saving in memory
   * instances for those found protos for later usage.
   */
  public execute(): void {
    this.getProtoPaths().forEach((protoPath: string) => {
      const protoName: string = protoPath.split('/').pop() ?? '';
      this.protos[protoName] = this.loadProto(protoPath);
      this.generate(protoPath);
    });
  }
  /**
   * This method will return a proto instance
   * from the proto list directory, previously loaded during
   * boot time.
   *
   * @param name
   *
   */
  public getProto(name: string): GrpcObject {
    return this.protos[name];
  }
  /**
   * This method receive a proto file path and
   * load that proto using the official grpc library.
   *
   * @param protoPath
   */
  public loadProto(protoPath: string): GrpcObject {
    const proto: GrpcObject = grpc.load(protoPath);
    return proto;
  }
  /**
   * This method will getProtoPaths a directory look ahead and
   * typescript files generations from found proto files.
   */
  public getProtoPaths(): string[] {
    const pattern = this.config.protoPattern ?? '**/*.proto';
    const ignores = this.config.protoIngores ?? ['**/node_modules/**'];
    const options = {
      cwd: this.config.cwd ?? process.cwd(),
      ignore: ignores,
      nodir: true,
    };
    return glob.sync(pattern, options);
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
