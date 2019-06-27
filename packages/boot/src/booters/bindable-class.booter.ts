// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BINDING_METADATA_KEY,
  createBindingFromClass,
  inject,
  MetadataInspector,
} from '@loopback/context';
import {Application, CoreBindings} from '@loopback/core';
import * as debugFactory from 'debug';
import {ArtifactOptions} from '../interfaces';
import {BootBindings} from '../keys';
import {BaseArtifactBooter} from './base-artifact.booter';

const debug = debugFactory('loopback:boot:class-booter');

/**
 * A class that extends BaseArtifactBooter to boot the generic Class or Provider
 * artifact type that is decorated with `@bind`.
 *
 * Supported phases: configure, discover, load
 *
 * @param app - Application instance
 * @param projectRoot - Root of User Project relative to which all paths are resolved
 * @param bootConfig - Artifact Options Object
 */
export class BindableClassBooter extends BaseArtifactBooter {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    public app: Application,
    @inject(BootBindings.PROJECT_ROOT) projectRoot: string,
    @inject(`${BootBindings.BOOT_OPTIONS}#bindables`)
    public classConfig: ArtifactOptions = {},
  ) {
    super(projectRoot, Object.assign({}, BindableClassDefaults, classConfig));
  }

  /**
   * Uses super method to get a list of Artifact classes. Boot each file by
   * creating a DataSourceConstructor and binding it to the application class.
   */
  async load() {
    await super.load();

    for (const cls of this.classes) {
      if (!MetadataInspector.getClassMetadata(BINDING_METADATA_KEY, cls)) {
        debug('Skip class not decorated with @bind: %s', cls.name);
        return;
      }
      debug('Bind class: %s', cls.name);
      const binding = createBindingFromClass(cls);
      this.app.add(binding);
      debug('Binding created for class: %j', binding);
    }
  }
}

/**
 * Default ArtifactOptions for BindableClassBooter.
 */
export const BindableClassDefaults: ArtifactOptions = {
  dirs: ['bindables'],
  extensions: ['.js'],
  nested: true,
};
