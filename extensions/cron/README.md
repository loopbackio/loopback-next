# @loopback/cron

This module contains a component to provide integration with
[Cron](https://github.com/kelektiv/node-cron) so that applications can schedule
jobs using `cron` based schedule.

## Stability: ⚠️Experimental⚠️

> Experimental packages provide early access to advanced or experimental
> functionality to get community feedback. Such modules are published to npm
> using `0.x.y` versions. Their APIs and functionality may be subject to
> breaking changes in future releases.

## Installation

```sh
npm install --save @loopback/cron
```

## Basic use

### Register the CronComponent

The component should be loaded in the constructor of your custom `Application`
class.

Start by importing the component class:

```ts
import {CronComponent} from '@loopback/cron';
```

In the constructor, add the component to your application:

```ts
this.component(CronComponent);
```

### Register cron jobs

We can create an instance of `CronJob` and bind it to the application context so
it can be managed by the `CronComponent` life cycles including `start` and
`stop`.

```ts
import {CronJob, asCronJob} from '@loopback/cron';

// Create an cron job
const job = new CronJob({
  cronTime: '*/1 * * * * *', // Every one second
  onTick: () => {
    // Do the work
  },
  start: true, // Start the job immediately
});

// Bind the cron job as an extension for the scheduler
app.bind('cron.jobs.job1').to(job).apply(asCronJob);
```

It's also possible to extend `CronJob`.

```ts
import {CronJob, cronJob, CronJobConfig} from '@loopback/cron';
import {config, Provider, createBindingFromClass} from '@loopback/context';

@cronJob()
class MyCronJob extends CronJob {
  constructor() {
    super({
      name: 'job-B',
      onTick: () => {
        // do the work
      },
      cronTime: startIn(50),
      start: false,
    });
  }
}

const jobBinding = createBindingFromClass(MyCronJob);
app.add(jobBinding);
```

Alternatively, we can also define a provider class:

```ts
import {CronJob, cronJob, CronJobConfig} from '@loopback/cron';
import {config, Provider, createBindingFromClass} from '@loopback/context';

@cronJob()
class CronJobProvider implements Provider<CronJob> {
  constructor(@config() private jobConfig: CronJobConfig = {}) {}
  value() {
    const job = new CronJob({
      // ... default config
      ...this.jobConfig,
    });
    return job;
  }
}

const jobBinding = createBindingFromClass(CronJobProvider);
app.add(jobBinding);
const now = new Date();
now.setMilliseconds(now.getMilliseconds() + 10);
const jobConfig: CronJobConfig = {
  name: 'job-B', // Name the job
  cronTime: sendAt(now), // Start the job in 10 ms
  start: false,
};
app.configure(jobBinding.key).to(jobConfig);
```

Please refer to [cron api](https://github.com/kelektiv/node-cron#api) for more
details about options to create a job.

By default, all cron jobs will be started and stopped by `CronComponent` when
the application is started or stopped.

To start a cron job after application starts, we can either set `start` to
`true` for the job or use the following code to start non-running jobs:

```ts
import {CronBindings} from '@loopback/cron';

const component = await app.get(CronBindings.COMPONENT);
await component.start();
```

### Error handling

The `CronJob` class from `@loopback/cron` is a subclass of the `CronJob` from
`cron` module to provide better error handling and troubleshooting.

To catch errors thrown from the job's `onTick` or other `callback` methods:

```ts
job.onError(err => {
  // process the error
});
```

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
