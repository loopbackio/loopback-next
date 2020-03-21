// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cron
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  config,
  createBindingFromClass,
  Provider,
} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {sendAt} from 'cron';
import {promisify} from 'util';
import {
  asCronJob,
  CronBindings,
  CronComponent,
  cronJob,
  CronJob,
  CronJobConfig,
} from '../..';
import {CronJobOptions} from '../../types';

const sleep = promisify(setTimeout);

describe('Cron (acceptance)', () => {
  let app: Application;
  let component: CronComponent;

  before(givenAppWithCron);

  after(async () => {
    if (app) await app.stop();
    (app as unknown) = undefined;
  });

  it('allows cron jobs to be bound as constant', async () => {
    let count = 0;
    const job = new CronJob({
      cronTime: '*/1 * * * * *', // Every second
      onTick: () => {
        count++;
      },
      runOnInit: true,
      start: true,
    });
    app.bind('cron.jobs.job1').to(job).apply(asCronJob);
    // The context event notification can happen before `await component.getJobs()`
    await sleep(1);
    const jobs = await component.getJobs();
    expect(jobs).to.eql([job]);
    expect(count).to.be.greaterThan(0);
  });

  it('allows cron jobs to be bound as class', async () => {
    let count = 0;

    @cronJob()
    class MyCronJob extends CronJob {
      constructor(@config() jobConfig: CronJobOptions) {
        super(jobConfig);
      }
    }

    const jobBinding = createBindingFromClass(MyCronJob);
    app.add(jobBinding);
    const jobConfig: CronJobConfig = {
      name: 'job-B',
      onTick: () => {
        count++;
      },
      cronTime: startIn(50),
      start: false,
    };
    app.configure(jobBinding.key).to(jobConfig);
    // The context event notification can happen before `await component.getJobs()`
    await sleep(1);
    const jobs = await component.getJobs();
    expect(jobs.length).to.eql(2);
    expect(count).to.be.eql(0);
    await component.start();
    await sleep(100);
    expect(count).to.be.greaterThan(0);
  });

  it('allows cron jobs to be bound as provider class', async () => {
    let count = 0;

    @cronJob()
    class CronJobProvider implements Provider<CronJob> {
      constructor(@config() private jobConfig: CronJobConfig = {}) {}
      value() {
        const job = new CronJob({
          cronTime: '* 1 * * * *', // Every min
          onTick: () => {
            count++;
          },
          start: true,
          ...this.jobConfig,
        });
        return job;
      }
    }

    const jobBinding = createBindingFromClass(CronJobProvider);
    app.add(jobBinding);
    const jobConfig: CronJobConfig = {
      name: 'job-C',
      cronTime: startIn(50),
      start: false,
    };
    app.configure(jobBinding.key).to(jobConfig);
    // The context event notification can happen before `await component.getJobs()`
    await sleep(1);
    const jobs = await component.getJobs();
    expect(jobs.length).to.eql(3);
    expect(count).to.be.eql(0);
    await component.start();
    await sleep(100);
    expect(count).to.be.greaterThan(0);
  });

  it('allows cron jobs to throw errors', async () => {
    const job = new CronJob({
      cronTime: startIn(10),
      onTick: () => {
        throw new Error('Something wrong in the job');
      },
      start: true,
    });
    let errCaught: unknown;
    job.onError(err => {
      errCaught = err;
    });
    app.bind('cron.jobs.job1').to(job).apply(asCronJob);
    await sleep(100);
    expect((errCaught as Error).message).to.eql('Something wrong in the job');
  });

  /**
   * Create a cron time to start execution in the given milliseconds
   * @param ms - milliseconds to start
   */
  function startIn(ms = 50) {
    const time = new Date();
    time.setMilliseconds(time.getMilliseconds() + ms);
    return sendAt(time);
  }

  async function givenAppWithCron() {
    app = new Application();
    app.component(CronComponent);
    component = await app.get(CronBindings.COMPONENT);
    await app.start();
    return app;
  }
});
