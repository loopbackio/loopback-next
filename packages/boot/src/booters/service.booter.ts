// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BINDING_METADATA_KEY,
  config,
  Constructor,
  inject,
  MetadataInspector,
} from '@loopback/context';
import {CoreBindings} from '@loopback/core';
import {ApplicationWithServices} from '@loopback/service-proxy';
import * as debugFactory from 'debug';
import {BootBindings} from '../keys';
import {ArtifactOptions, booter} from '../types';
import {BaseArtifactBooter} from './base-artifact.booter';

const debug = debugFactory('loopback:boot:service-booter');

/**
 * A class that extends BaseArtifactBooter to boot the 'Service' artifact type.
 * Discovered DataSources are bound using `app.controller()`.
 *
 * Supported phases: configure, discover, load
 *
 * @param app - Application instance
 * @param projectRoot - Root of User Project relative to which all paths are resolved
 * @param bootConfig - Service Artifact Options Object
 */
@booter('services')
export class ServiceBooter extends BaseArtifactBooter {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    public app: ApplicationWithServices,
    @inject(BootBindings.PROJECT_ROOT) projectRoot: string,
    @config()
    public serviceConfig: ArtifactOptions = {},
  ) {
    super(
      projectRoot,
      // Set Service Booter Options if passed in via bootConfig
      Object.assign({}, ServiceDefaults, serviceConfig),
    );
  }

  /**
   * Uses super method to get a list of Artifact classes. Boot each file by
   * creating a DataSourceConstructor and binding it to the application class.
   */
  async load() {
    await super.load();

    for (const cls of this.classes) {
      if (!isBindableClass(cls)) continue;

      debug('Bind class: %s', cls.name);
      const binding = this.app.service(cls);
      debug('Binding created for class: %j', binding);
    }
  }
}

/**
 * Default ArtifactOptions for DataSourceBooter.
 */
export const ServiceDefaults: ArtifactOptions = {
  dirs: ['services'],
  extensions: ['.service.js'],
  nested: true,
};

function isServiceProvider(cls: Constructor<unknown>) {
  const hasSupportedName = cls.name.endsWith('Provider');
  const hasValueMethod = typeof cls.prototype.value === 'function';
  return hasSupportedName && hasValueMethod;
}

function isBindableClass(cls: Constructor<unknown>) {
  if (MetadataInspector.getClassMetadata(BINDING_METADATA_KEY, cls)) {
    return true;
  }
  if (isServiceProvider(cls)) {
    debug('Provider class found: %s', cls.name);
    return true;
  }
  debug('Skip class not decorated with @bind: %s', cls.name);
  return false;
}
