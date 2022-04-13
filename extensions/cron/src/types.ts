// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/cron
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, BindingScope, extensionFor} from '@loopback/core';
import {CronJob as BaseCronJob, CronJobParameters} from 'cron';
import {EventEmitter} from 'events';
import {CronBindings} from './keys';

/**
 * Options for a cron job. It adds an optional `name` to cron parameters.
 *
 * {@link https://github.com/kelektiv/node-cron#api | cron configuration}
 */
export type CronJobOptions = CronJobParameters & {name?: string};

/**
 * Configuration for a cron job.
 */
export type CronJobConfig = Partial<CronJobOptions>;

/**
 * Name of the cron job extension point
 */
export const CRON_JOB_SCHEDULER = 'cron.jobScheduler';

/**
 * A `BindingTemplate` function to configure the binding as a cron job.
 *
 * @param binding - Binding object
 */
export function asCronJob<T = unknown>(binding: Binding<T>) {
  return binding
    .apply(extensionFor(CRON_JOB_SCHEDULER))
    .tag({namespace: CronBindings.CRON_JOB_NAMESPACE})
    .inScope(BindingScope.SINGLETON);
}

/**
 * Cron job with an optional name
 */
export class CronJob extends BaseCronJob {
  private static count = 0;
  public readonly name: string;
  public readonly emitter: EventEmitter = new EventEmitter();

  constructor(options: CronJobOptions) {
    super(options);
    if (options.name) {
      this.name = options.name;
    } else {
      this.name = `job-${++CronJob.count}`;
    }
    // Override `fireOnTick` to catch errors
    this.fireOnTick = () => {
      try {
        return super.fireOnTick();
      } catch (err) {
        this.emitter.emit('error', err);
      }
    };
  }

  public onError(listener: (err: unknown) => void) {
    this.emitter.on('error', listener);
  }
}
