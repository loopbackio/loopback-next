// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {config, inject, Application, CoreBindings} from '@loopback/core';
import {BootBindings} from '../keys';
import {ArtifactOptions, booter} from '../types';
import {BaseArtifactBooter} from './base-artifact.booter';

/**
 * A class that extends BaseArtifactBooter to boot the 'Controller' artifact type.
 * Discovered controllers are bound using `app.controller()`.
 *
 * Supported phases: configure, discover, load
 *
 * @param app - Application instance
 * @param projectRoot - Root of User Project relative to which all paths are resolved
 * @param bootConfig - Controller Artifact Options Object
 */
@booter('controllers')
export class ControllerBooter extends BaseArtifactBooter {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) public app: Application,
    @inject(BootBindings.PROJECT_ROOT) projectRoot: string,
    @config()
    public controllerConfig: ArtifactOptions = {},
  ) {
    super(
      projectRoot,
      // Set Controller Booter Options if passed in via bootConfig
      Object.assign({}, ControllerDefaults, controllerConfig),
    );
  }

  /**
   * Uses super method to get a list of Artifact classes. Boot each class by
   * binding it to the application using `app.controller(controller);`.
   */
  async load() {
    await super.load();
    this.classes.forEach(cls => {
      this.app.controller(cls);
    });
  }
}

/**
 * Default ArtifactOptions for ControllerBooter.
 */
export const ControllerDefaults: ArtifactOptions = {
  dirs: ['controllers'],
  extensions: ['.controller.js'],
  nested: true,
};
