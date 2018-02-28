// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CoreBindings} from '@loopback/core';
import {inject} from '@loopback/context';
import {AppWithRepository} from '@loopback/repository';
import {BaseArtifactBooter} from './base-artifact.booter';
import {BootBindings} from '../keys';
import {ArtifactOptions} from '../interfaces';

/**
 * A class that extends BaseArtifactBooter to boot the 'Repository' artifact type.
 * Discovered repositories are bound using `app.repository()` which must be added
 * to an Application using the `RepositoryMixin` from `@loopback/repository`.
 *
 * Supported phases: configure, discover, load
 *
 * @param app Application instance
 * @param projectRoot Root of User Project relative to which all paths are resolved
 * @param [bootConfig] Repository Artifact Options Object
 */
export class RepositoryBooter extends BaseArtifactBooter {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) public app: AppWithRepository,
    @inject(BootBindings.PROJECT_ROOT) public projectRoot: string,
    @inject(`${BootBindings.BOOT_OPTIONS}#repositories`)
    public repositoryOptions: ArtifactOptions = {},
  ) {
    super();

    /**
     * Repository Booter requires the use of RepositoryMixin (so we have `app.repository`)
     * for binding a Repository Class. We check for it's presence and run
     * accordingly.
     */
    // tslint:disable-next-line:no-any
    if (!this.app.repository) {
      console.warn(
        'app.repository() function is needed for RepositoryBooter. You can add ' +
          'it to your Application using RepositoryMixin from @loopback/repository.',
      );

      /**
       * If RepositoryMixin is not used and a `.repository()` function is not
       * available, we change the methods to be empty so bootstrapper can
       * still run without any side-effects of loading this Booter.
       */
      this.configure = async () => {};
      this.discover = async () => {};
      this.load = async () => {};
    } else {
      // Set Repository Booter Options if passed in via bootConfig
      this.options = Object.assign({}, RepositoryDefaults, repositoryOptions);
    }
  }

  /**
   * Uses super method to get a list of Artifact classes. Boot each class by
   * binding it to the application using `app.repository(repository);` if present.
   */
  async load() {
    await super.load();
    this.classes.forEach(cls => {
      // tslint:disable-next-line:no-any
      this.app.repository(cls);
    });
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
