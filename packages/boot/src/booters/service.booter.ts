// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CoreBindings} from '@loopback/core';
import {ApplicationWithServices} from '@loopback/service-proxy';
import {inject, Provider, Constructor} from '@loopback/context';
import {ArtifactOptions} from '../interfaces';
import {BaseArtifactBooter} from './base-artifact.booter';
import {BootBindings} from '../keys';

type ServiceProviderClass = Constructor<Provider<object>>;

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
export class ServiceBooter extends BaseArtifactBooter {
  serviceProviders: ServiceProviderClass[];

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    public app: ApplicationWithServices,
    @inject(BootBindings.PROJECT_ROOT) projectRoot: string,
    @inject(`${BootBindings.BOOT_OPTIONS}#services`)
    public serviceConfig: ArtifactOptions = {},
  ) {
    super(
      projectRoot,
      // Set DataSource Booter Options if passed in via bootConfig
      Object.assign({}, ServiceDefaults, serviceConfig),
    );
  }

  /**
   * Uses super method to get a list of Artifact classes. Boot each file by
   * creating a DataSourceConstructor and binding it to the application class.
   */
  async load() {
    await super.load();

    this.serviceProviders = this.classes.filter(isServiceProvider);

    /**
     * If Service providers were discovered, we need to make sure ServiceMixin
     * was used (so we have `app.serviceProvider()`) to perform the binding of a
     * Service provider class.
     */
    if (this.serviceProviders.length > 0) {
      if (!this.app.serviceProvider) {
        console.warn(
          'app.serviceProvider() function is needed for ServiceBooter. You can add ' +
            'it to your Application using ServiceMixin from @loopback/service-proxy.',
        );
      } else {
        this.serviceProviders.forEach(cls => {
          this.app.serviceProvider(cls as Constructor<Provider<object>>);
        });
      }
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

function isServiceProvider(cls: Constructor<{}>): cls is ServiceProviderClass {
  const hasSupportedName = cls.name.endsWith('Provider');
  const hasValueMethod = 'value' in cls.prototype;
  return hasSupportedName && hasValueMethod;
}
