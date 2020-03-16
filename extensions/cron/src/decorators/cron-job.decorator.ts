// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cron
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, BindingSpec} from '@loopback/core';
import {asCronJob} from '../types';

/**
 * `@cronJob` decorates a cron job provider class
 *
 * @example
 * ```ts
 * @cronJob()
 * class CronJobProvider implements Provider<CronJob> {
 *   constructor(@config() private jobConfig: CronJobConfig = {}) {}
 *   value() {
 *     // ...
 *   }
 * }
 * ```
 * @param specs - Extra binding specs
 */
export function cronJob(...specs: BindingSpec[]) {
  return bind(asCronJob, ...specs);
}
