// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/extension-health
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  HealthChecker,
  LivenessCheck,
  ReadinessCheck,
  ShutdownCheck,
  StartupCheck,
} from '@cloudnative/health';
import {
  ContextView,
  filterByTag,
  inject,
  LifeCycleObserver,
} from '@loopback/core';
import {EventEmitter, once as onceGeneric} from 'events';
import {HealthBindings, HealthTags} from '../keys';
import {LiveCheck, ReadyCheck} from '../types';

export class HealthObserver implements LifeCycleObserver {
  private eventEmitter = new EventEmitter();
  private startupCheck: Promise<void>;
  private shutdownCheck: ShutdownCheck;

  constructor(
    @inject(HealthBindings.HEALTH_CHECKER) private healthChecker: HealthChecker,

    @inject.view(filterByTag(HealthTags.LIVE_CHECK))
    private liveChecks: ContextView<LiveCheck>,

    @inject.view(filterByTag(HealthTags.READY_CHECK))
    private readyChecks: ContextView<ReadyCheck>,
  ) {
    const startup = (once(this.eventEmitter, 'startup') as unknown) as Promise<
      void
    >;
    const startupCheck = new StartupCheck('startup', () => startup);
    this.startupCheck = this.healthChecker.registerStartupCheck(startupCheck);
    const shutdown = once(this.eventEmitter, 'shutdown');
    this.shutdownCheck = new ShutdownCheck('shutdown', () => shutdown);
  }

  async start() {
    this.healthChecker.registerShutdownCheck(this.shutdownCheck);
    const liveChecks = await this.liveChecks.values();
    const liveCheckBindings = this.liveChecks.bindings;
    let index = 0;
    for (const lc of liveChecks) {
      const name = liveCheckBindings[index].key;
      const check = new LivenessCheck(name, lc);
      this.healthChecker.registerLivenessCheck(check);
      index++;
    }

    const readyChecks = await this.readyChecks.values();
    const readyCheckBindings = this.readyChecks.bindings;
    index = 0;
    for (const rc of readyChecks) {
      const name = readyCheckBindings[index].key;
      const check = new ReadinessCheck(name, rc);
      this.healthChecker.registerReadinessCheck(check);
      index++;
    }

    this.eventEmitter.emit('startup');
    await this.startupCheck;
  }

  stop() {
    this.eventEmitter.emit('shutdown');
    // Fix a potential memory leak caused by
    // https://github.com/CloudNativeJS/cloud-health/blob/2.1.2/src/healthcheck/HealthChecker.ts#L118
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onShutdownRequest = (this.healthChecker as any).onShutdownRequest;
    if (onShutdownRequest != null) {
      // Remove the listener from the current process
      process.removeListener('SIGTERM', onShutdownRequest);
    }
  }
}

function once(emitter: EventEmitter, event: string | symbol): Promise<void> {
  return (onceGeneric(emitter, event) as unknown) as Promise<void>;
}
