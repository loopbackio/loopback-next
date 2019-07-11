// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-metrics
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {config, LifeCycleObserver} from '@loopback/core';
import {collectDefaultMetrics, register} from 'prom-client';
import {MetricsBindings} from '../keys';
import {DEFAULT_METRICS_OPTIONS, MetricsOptions} from '../types';

/**
 * An observer to set default Node.js metrics collection
 */
export class MetricsObserver implements LifeCycleObserver {
  private interval: NodeJS.Timeout | undefined;

  constructor(
    @config({fromBinding: MetricsBindings.COMPONENT})
    private options: MetricsOptions = DEFAULT_METRICS_OPTIONS,
  ) {}

  start() {
    const defaultMetricsConfig = this.options.defaultMetrics;
    this.interval = collectDefaultMetrics(defaultMetricsConfig);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
      register.clear();
    }
  }
}
