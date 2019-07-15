// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-health
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {HealthChecker} from '@cloudnative/health';
import {
  Application,
  bind,
  BindingScope,
  Component,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  config,
  ContextTags,
  CoreBindings,
  inject,
} from '@loopback/core';
import {createHealthController} from './controllers';
import {HealthBindings} from './keys';
import {HealthObserver} from './observers';
import {DEFAULT_HEALTH_OPTIONS, HealthConfig, HealthOptions} from './types';

/**
 * A component providing health status
 */
@bind({tags: {[ContextTags.KEY]: HealthBindings.COMPONENT}})
export class HealthComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: Application,
    @config()
    healthConfig: HealthConfig = DEFAULT_HEALTH_OPTIONS,
  ) {
    // Bind the HealthCheck service
    this.application
      .bind(HealthBindings.HEALTH_CHECKER)
      .toClass(HealthChecker)
      .inScope(BindingScope.SINGLETON);

    // Bind the health observer
    this.application.lifeCycleObserver(HealthObserver);

    const options: HealthOptions = {
      ...DEFAULT_HEALTH_OPTIONS,
      ...healthConfig,
    };
    if (!options.disabled) {
      this.application.controller(createHealthController(options));
    }
  }
}
