// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  config,
  Constructor,
  CoreBindings,
  inject,
  Interceptor,
  Provider,
} from '@loopback/core';
import debugFactory from 'debug';
import {BootBindings} from '../keys';
import {ArtifactOptions, booter} from '../types';
import {BaseArtifactBooter} from './base-artifact.booter';

const debug = debugFactory('loopback:boot:interceptor-booter');

type InterceptorProviderClass = Constructor<Provider<Interceptor>>;

/**
 * A class that extends BaseArtifactBooter to boot the 'InterceptorProvider' artifact type.
 *
 * Supported phases: configure, discover, load
 *
 * @param app - Application instance
 * @param projectRoot - Root of User Project relative to which all paths are resolved
 * @param bootConfig - InterceptorProvider Artifact Options Object
 */
@booter('interceptors')
export class InterceptorProviderBooter extends BaseArtifactBooter {
  interceptors: InterceptorProviderClass[];

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    public app: Application,
    @inject(BootBindings.PROJECT_ROOT) projectRoot: string,
    @config()
    public interceptorConfig: ArtifactOptions = {},
  ) {
    super(
      projectRoot,
      // Set InterceptorProvider Booter Options if passed in via bootConfig
      Object.assign({}, InterceptorProviderDefaults, interceptorConfig),
    );
  }

  /**
   * Uses super method to get a list of Artifact classes. Boot each file by
   * creating a DataSourceConstructor and binding it to the application class.
   */
  async load() {
    await super.load();

    this.interceptors = this.classes as InterceptorProviderClass[];
    for (const interceptor of this.interceptors) {
      debug('Bind interceptor: %s', interceptor.name);
      const binding = this.app.interceptor(interceptor);
      debug('Binding created for interceptor: %j', binding);
    }
  }
}

/**
 * Default ArtifactOptions for InterceptorProviderBooter.
 */
export const InterceptorProviderDefaults: ArtifactOptions = {
  dirs: ['interceptors'],
  extensions: ['.interceptor.js'],
  nested: true,
};
