// Copyright IBM Corp. 2019. All Rights Reserved.
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
import {EventEmitter} from 'events';
import pEvent from 'p-event';
import {HealthBindings, HealthTags} from '../keys';
import {LiveCheck, ReadyCheck} from '../types';

export class HealthObserver implements LifeCycleObserver {
  private eventEmitter = new EventEmitter();
  private startupCheck: Promise<void>;

  constructor(
    @inject(HealthBindings.HEALTH_CHECKER) private healthChecker: HealthChecker,

    @inject.view(filterByTag(HealthTags.LIVE_CHECK))
    private liveChecks: ContextView<LiveCheck>,

    @inject.view(filterByTag(HealthTags.READY_CHECK))
    private readyChecks: ContextView<ReadyCheck>,
  ) {
    const startup = pEvent(this.eventEmitter, 'startup');
    const startupCheck = new StartupCheck('startup', () => startup);

    const shutdown = pEvent(this.eventEmitter, 'shutdown');
    const shutdownCheck = new ShutdownCheck('shutdown', () => shutdown);

    this.startupCheck = this.healthChecker.registerStartupCheck(startupCheck);
    this.healthChecker.registerShutdownCheck(shutdownCheck);
  }

  async start() {
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
  }
}
