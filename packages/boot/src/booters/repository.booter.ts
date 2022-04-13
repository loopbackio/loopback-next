// Copyright IBM Corp. and LoopBack contributors 2018,2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {config, CoreBindings, inject} from '@loopback/core';
import {ApplicationWithRepositories} from '@loopback/repository';
import {BootBindings} from '../keys';
import {ArtifactOptions, booter} from '../types';
import {BaseArtifactBooter} from './base-artifact.booter';

/**
 * A class that extends BaseArtifactBooter to boot the 'Repository' artifact type.
 * Discovered repositories are bound using `app.repository()` which must be added
 * to an Application using the `RepositoryMixin` from `@loopback/repository`.
 *
 * Supported phases: configure, discover, load
 *
 * @param app - Application instance
 * @param projectRoot - Root of User Project relative to which all paths are resolved
 * @param bootConfig - Repository Artifact Options Object
 */
@booter('repositories')
export class RepositoryBooter extends BaseArtifactBooter {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    public app: ApplicationWithRepositories,
    @inject(BootBindings.PROJECT_ROOT) projectRoot: string,
    @config()
    public repositoryOptions: ArtifactOptions = {},
  ) {
    super(
      projectRoot,
      // Set Repository Booter Options if passed in via bootConfig
      Object.assign({}, RepositoryDefaults, repositoryOptions),
    );
  }

  /**
   * Uses super method to get a list of Artifact classes. Boot each class by
   * binding it to the application using `app.repository(repository);` if present.
   */
  async load() {
    await super.load();
    /**
     * If Repository Classes were discovered, we need to make sure RepositoryMixin
     * was used (so we have `app.repository()`) to perform the binding of a
     * Repository Class.
     */
    if (this.classes.length > 0) {
      if (!this.app.repository) {
        console.warn(
          'app.repository() function is needed for RepositoryBooter. You can add ' +
            'it to your Application using RepositoryMixin from @loopback/repository.',
        );
      } else {
        this.classes.forEach(cls => {
          this.app.repository(cls);
        });
      }
    }
  }
}

/**
 * Default ArtifactOptions for RepositoryBooter.
 */
export const RepositoryDefaults: ArtifactOptions = {
  dirs: ['repositories'],
  extensions: ['.repository.js'],
  nested: true,
};
