// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CoreBindings} from '@loopback/core';
import {
  ApplicationWithRepositories,
  juggler,
  Class,
} from '@loopback/repository';
import {inject} from '@loopback/context';
import {ArtifactOptions} from '../interfaces';
import {BaseArtifactBooter} from './base-artifact.booter';
import {BootBindings} from '../keys';

/**
 * A class that extends BaseArtifactBooter to boot the 'DataSource' artifact type.
 * Discovered DataSources are bound using `app.controller()`.
 *
 * Supported phases: configure, discover, load
 *
 * @param app Application instance
 * @param projectRoot Root of User Project relative to which all paths are resolved
 * @param [bootConfig] DataSource Artifact Options Object
 */
export class DataSourceBooter extends BaseArtifactBooter {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    public app: ApplicationWithRepositories,
    @inject(BootBindings.PROJECT_ROOT) projectRoot: string,
    @inject(`${BootBindings.BOOT_OPTIONS}#datasources`)
    public datasourceConfig: ArtifactOptions = {},
  ) {
    super(
      projectRoot,
      // Set DataSource Booter Options if passed in via bootConfig
      Object.assign({}, DataSourceDefaults, datasourceConfig),
    );
  }

  /**
   * Uses super method to get a list of Artifact classes. Boot each file by
   * creating a DataSourceConstructor and binding it to the application class.
   */
  async load() {
    await super.load();

    /**
     * If DataSource Classes were discovered, we need to make sure RepositoryMixin
     * was used (so we have `app.dataSource()`) to perform the binding of a
     * DataSource Class.
     */
    if (this.classes.length > 0) {
      if (!this.app.dataSource) {
        console.warn(
          'app.dataSource() function is needed for DataSourceBooter. You can add ' +
            'it to your Application using RepositoryMixin from @loopback/repository.',
        );
      } else {
        this.classes.forEach(cls => {
          // tslint:disable-next-line:no-any
          this.app.dataSource(cls as Class<juggler.DataSource>);
        });
      }
    }
  }
}

/**
 * Default ArtifactOptions for DataSourceBooter.
 */
export const DataSourceDefaults: ArtifactOptions = {
  dirs: ['datasources'],
  extensions: ['.datasource.js'],
  nested: true,
};
