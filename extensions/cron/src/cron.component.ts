// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/cron
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingScope,
  Component,
  ContextTags,
  extensionPoint,
  extensions,
  Getter,
  lifeCycleObserver,
  LifeCycleObserver,
} from '@loopback/core';
import debugFactory from 'debug';
import {CronBindings} from './keys';
import {CronJob, CRON_JOB_SCHEDULER} from './types';

const debug = debugFactory('loopback:cron');

/**
 * The CronComponent manages cron jobs. It serves as an extension point for
 * cron jobs.
 */
@extensionPoint(CRON_JOB_SCHEDULER, {
  tags: {[ContextTags.KEY]: CronBindings.COMPONENT},
  scope: BindingScope.SINGLETON,
})
@lifeCycleObserver('cronJob')
export class CronComponent implements Component, LifeCycleObserver {
  constructor(@extensions() public readonly getJobs: Getter<CronJob[]>) {}

  async start() {
    const jobs = await this.getJobs();
    for (const job of jobs) {
      debug('[start] job', job.name);
      if (!job.running) {
        debug('starting job', job.name);
        job.start();
      }
    }
  }

  async stop() {
    const jobs = await this.getJobs();
    for (const job of jobs) {
      debug('[stop] job', job.name);
      if (job.running) {
        debug('stopping job', job.name);
        job.stop();
      }
    }
  }
}
