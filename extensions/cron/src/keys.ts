// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/cron
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {CronComponent} from './cron.component';

/**
 * Binding keys used by this component.
 */
export namespace CronBindings {
  /**
   * Binding key for `CronComponent`
   */
  export const COMPONENT = BindingKey.create<CronComponent>(
    'components.CronComponent',
  );

  /**
   * Namespace for cron jobs
   */
  export const CRON_JOB_NAMESPACE = 'cron.jobs';
}
