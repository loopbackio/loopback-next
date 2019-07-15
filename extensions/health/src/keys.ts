// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-health
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {HealthChecker} from '@cloudnative/health';
import {BindingKey} from '@loopback/core';
import {HealthComponent} from './health.component';
import {HealthConfig} from './types';

/**
 * Binding keys used by this component.
 */
export namespace HealthBindings {
  export const COMPONENT = BindingKey.create<HealthComponent>(
    'components.HealthComponent',
  );

  export const CONFIG = BindingKey.buildKeyForConfig<HealthConfig>(
    COMPONENT.key,
  );

  export const HEALTH_CHECKER = BindingKey.create<HealthChecker>(
    'health.HeathChecker',
  );
}

/**
 * Binding tags for health related services
 */
export namespace HealthTags {
  /**
   * Binding tag for liveness check functions
   */
  export const LIVE_CHECK = 'health.liveCheck';
  /**
   * Binding tag for readiness check functions
   */
  export const READY_CHECK = 'health.readyCheck';
}
