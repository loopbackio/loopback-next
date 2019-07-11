// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-metrics
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {config, LifeCycleObserver} from '@loopback/core';
import {Pushgateway} from 'prom-client';
import {MetricsBindings} from '../keys';
import {DEFAULT_METRICS_OPTIONS, MetricsOptions} from '../types';

/**
 * An observer to set up periodical push of metrics to a push gateway
 */
export class MetricsPushObserver implements LifeCycleObserver {
  private interval: NodeJS.Timeout | undefined;
  private gateway: Pushgateway;

  constructor(
    @config({fromBinding: MetricsBindings.COMPONENT})
    private options: MetricsOptions = DEFAULT_METRICS_OPTIONS,
  ) {}

  start() {
    const gwConfig = this.options.pushGateway;
    if (!gwConfig) return;
    this.gateway = new Pushgateway(gwConfig.url);
    this.interval = setInterval(() => {
      this.gateway.pushAdd({jobName: 'loopback'}, () => {});
    }, gwConfig.interval || 5000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }
}
