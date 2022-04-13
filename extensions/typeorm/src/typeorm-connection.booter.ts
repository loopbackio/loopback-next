// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ArtifactOptions,
  BaseArtifactBooter,
  BootBindings,
  booter,
} from '@loopback/boot';
import {config, CoreBindings, inject} from '@loopback/core';
import debugFactory from 'debug';
import {ApplicationUsingTypeOrm, ConnectionOptions} from './';
const debug = debugFactory('loopback:typeorm:mixin');

/**
 * A class that extends BaseArtifactBooter to boot the TypeORM connection artifact type.
 *
 * Supported phases: configure, discover, load
 *
 * @param app - Application instance
 * @param projectRoot - Root of user's project relative to which all paths are resolved
 * @param bootConfig - Connection artifact options object
 */
@booter('connections')
export class TypeOrmConnectionBooter extends BaseArtifactBooter {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    public app: ApplicationUsingTypeOrm,
    @inject(BootBindings.PROJECT_ROOT) projectRoot: string,
    @config()
    public entityConfig: ArtifactOptions = {},
  ) {
    super(
      projectRoot,
      // Set TypeORM connection options if passed in via bootConfig
      Object.assign({}, ConnectionDefaults, entityConfig),
    );
  }

  async load() {
    for (const file of this.discovered) {
      if (!this.app.connection) {
        console.warn(
          'app.connection() function is needed for TypeOrmConnectionBooter. You can add ' +
            'it to your Application using TypeOrmMixin from @loopback/typeorm.',
        );
      } else {
        const connections = require(file);
        for (const k in connections) {
          const connection: ConnectionOptions = connections[k];
          debug('Bind class: %s', connection.name);
          const binding = this.app.connection(connection);
          debug(
            'Binding created for connection %s: %j',
            connection.name,
            binding,
          );
        }
      }
    }
  }
}

/**
 * Default ArtifactOptions for TypeORM connection.
 */
export const ConnectionDefaults: ArtifactOptions = {
  dirs: ['typeorm-connections'],
  extensions: ['.connection.js'],
  nested: true,
};
