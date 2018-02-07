// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CoreBindings, Application, BootOptions} from '@loopback/core';
import {inject} from '@loopback/context';
import {BootBindings} from '../keys';
import {BaseArtifactBooter, ArtifactOptions} from './base-artifact.booter';

/**
 * A class that extends BaseArtifactBooter to boot the 'Controller' artifact type.
 * Discovered controllers are bound using `app.controller()`.
 *
 * Supported phases: configure, discover, load
 *
 * @param app Application instance
 * @param bootConfig BootStrapper Config Options
 */
export class ControllerBooter extends BaseArtifactBooter {
  constructor(
    @inject(BootBindings.BOOT_OPTIONS) public bootConfig: BootOptions,
    @inject(CoreBindings.APPLICATION_INSTANCE) public app: Application,
  ) {
    super(bootConfig);
    // Set Controller Booter Options if passed in via bootConfig
    this.options = bootConfig.controllers
      ? Object.assign({}, ControllerDefaults, bootConfig.controllers)
      : Object.assign({}, ControllerDefaults);
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
 * Default ArtifactOptions for a ControllerBooter.
 */
export const ControllerDefaults: ArtifactOptions = {
  dirs: ['controllers'],
  extensions: ['.controller.js'],
  nested: true,
};
