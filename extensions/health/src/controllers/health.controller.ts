// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-health
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {HealthChecker} from '@cloudnative/health';
import {bind, BindingScope, Constructor, inject} from '@loopback/core';
import {get} from '@loopback/rest';
import {HealthBindings} from '../keys';
import {DEFAULT_HEALTH_OPTIONS, HealthOptions} from '../types';

/**
 * A factory function to create a controller class for health endpoints. This
 * makes it possible to customize decorations such as `@get` with a dynamic
 * path value not known at compile time.
 *
 * @param options - Options for health endpoints
 */
export function createHealthController(
  options: HealthOptions = DEFAULT_HEALTH_OPTIONS,
): Constructor<unknown> {
  /**
   * Controller for health endpoints
   */
  @bind({scope: BindingScope.SINGLETON})
  class HealthController {
    constructor(
      @inject(HealthBindings.HEALTH_CHECKER)
      private healthChecker: HealthChecker,
    ) {}

    @get(options.healthPath, {
      responses: {},
      'x-visibility': 'undocumented',
    })
    health() {
      return this.healthChecker.getStatus();
    }

    @get(options.readyPath, {
      responses: {},
      'x-visibility': 'undocumented',
    })
    async ready() {
      const status = await this.healthChecker.getReadinessStatus();
      return status;
    }

    @get(options.livePath, {
      responses: {},
      'x-visibility': 'undocumented',
    })
    async live() {
      const status = await this.healthChecker.getLivenessStatus();
      return status;
    }
  }

  return HealthController;
}
