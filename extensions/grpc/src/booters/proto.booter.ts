// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {GrpcObject, loadPackageDefinition} from '@grpc/grpc-js';
import {load} from '@grpc/proto-loader';
import {
  ArtifactOptions,
  BaseArtifactBooter,
  BootBindings,
  booter,
} from '@loopback/boot';
import {Application, config, CoreBindings, inject} from '@loopback/core';
import debugFactory from 'debug';
import path from 'path';
import {GrpcTags} from '../keys';
const debug = debugFactory('loopback:grpc:booter:proto');

/**
 * A class that extends BaseArtifactBooter to boot the gRPC proto artifact type.
 *
 * Supported phases: configure, discover, load
 *
 * @param app - Application instance
 * @param projectRoot - Root of user's project relative to which all paths are resolved
 * @param bootConfig - Proto artifact options object
 */
@booter('protos')
export class ProtoBooter extends BaseArtifactBooter {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    public app: Application,
    @inject(BootBindings.PROJECT_ROOT) projectRoot: string,
    @config()
    public protoConfig: ArtifactOptions = {},
  ) {
    super(
      projectRoot,
      // Set proto options if passed in via bootConfig
      {...ProtoDefaults, ...protoConfig},
    );
  }

  async load() {
    debug('Discovered proto files', this.discovered);
    for (const file of this.discovered) {
      const name = path.basename(file);
      const protoDef = await load(file);
      const obj: GrpcObject = loadPackageDefinition(protoDef);
      debug('Loaded proto object', obj);
      this.app
        .bind(`grpc.protos.${name}`)
        .to(obj)
        .tag(GrpcTags.PROTO)
        .tag(file);
    }
  }
}

/**
 * Default ArtifactOptions for gRPC proto files.
 */
export const ProtoDefaults: ArtifactOptions = {
  dirs: ['protos'],
  extensions: ['.proto'],
  nested: true,
};
