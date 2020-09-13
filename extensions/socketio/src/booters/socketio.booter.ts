// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// This file is based on https://github.com/strongloop/loopback-next/blob/master/packages/boot/src/booters/repository.booter.ts

import {
  ArtifactOptions,
  BaseArtifactBooter,
  BootBindings,
  booter,
} from '@loopback/boot';
import {Application, config, CoreBindings, inject} from '@loopback/core';
import {SocketIoBindings} from '../keys';
import {SocketIoServer} from '../socketio.server';

/**
 * A class that extends BaseArtifactBooter to boot the 'SocketIoController' artifact type.
 * Discovered controllers are bound using `app.controller()`.
 *
 * Supported phases: configure, discover, load
 *
 * @param app - Application instance
 * @param projectRoot - Root of User Project relative to which all paths are resolved
 * @param socketioControllerConfig - Controller Artifact Options Object
 */
@booter('socketioControllers')
export class SocketIoBooter extends BaseArtifactBooter {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) public app: Application,
    @inject(BootBindings.PROJECT_ROOT) projectRoot: string,
    @config() public socketioControllerConfig: ArtifactOptions = {},
    @inject(SocketIoBindings.SERVER)
    protected socketioServer: SocketIoServer,
  ) {
    super(
      projectRoot,
      // Set Controller Booter Options if passed in via bootConfig
      Object.assign({}, SocketIoControllerDefaults, socketioControllerConfig),
    );
  }

  /**
   * Uses super method to get a list of Artifact classes. Boot each class by
   * binding it to the application using `app.controller(controller);`.
   */
  async load() {
    await super.load();
    const wsServer = await this.app.get(SocketIoBindings.SERVER);
    this.classes.forEach(cls => {
      wsServer.route(cls);
    });
  }
}

/**
 * Default ArtifactOptions for SocketIoControllerBooter.
 */
export const SocketIoControllerDefaults: ArtifactOptions = {
  dirs: ['ws-controllers'],
  extensions: ['.controller.js'],
  nested: true,
};
