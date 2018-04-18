// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CoreBindings} from '@loopback/core';
import {
  AppWithRepository,
  DataSourceConstructor,
  DataSourceType,
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
    @inject(CoreBindings.APPLICATION_INSTANCE) public app: AppWithRepository,
    @inject(BootBindings.PROJECT_ROOT) public projectRoot: string,
    @inject(`${BootBindings.BOOT_OPTIONS}#datasources`)
    public datasourceConfig: ArtifactOptions = {},
    @inject(`${CoreBindings.APPLICATION_CONFIG}#datasources`)
    private dataSources: Array<DataSourceType> = [],
  ) {
    super();
    // Set DataSource Booter Options if passed in via bootConfig
    this.options = Object.assign({}, DatasourceDefaults, datasourceConfig);
  }

  /**
   * Uses super method to get a list of Artifact classes. Boot each file by
   * creating a DataSourceConstructor and binding it to the application class.
   */
  async load() {
    if (!this.app.dataSource) {
      console.warn(
        'app.dataSource() function is needed for DataSourceBooter. You can add ' +
          'it to your Application using RepositoryMixin from @loopback/repository.',
      );
    } else {
      this.discovered.forEach(file => {
        const ds = require(file);
        this.loadDataSource(ds, file);
      });

      // This allows override of a datasource for testing purposes!
      for (const ds of this.dataSources) {
        this.loadDataSource(ds);
      }
    }
  }

  private loadDataSource(ds: DataSourceType, file?: string) {
    if (ds.name) {
      const dsObject = new DataSourceConstructor(ds);
      this.app.dataSource(dsObject);
    } else {
      file = file ? file : JSON.stringify(ds);
      console.warn(
        `${file} was not initialized as a DataSourceConstructor because the 'name' property was missing.`,
      );
    }
  }
}

/**
 * Default ArtifactOptions for DataSourceBooter.
 */
export const DatasourceDefaults: ArtifactOptions = {
  dirs: ['datasources'],
  extensions: ['.datasource.json'],
  nested: true,
};
