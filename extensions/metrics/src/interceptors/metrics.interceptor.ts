// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-metrics
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  asGlobalInterceptor,
  bind,
  BindingScope,
  Interceptor,
  InvocationContext,
  Provider,
  ValueOrPromise,
} from '@loopback/context';
import {Counter, Gauge, Histogram, register, Summary} from 'prom-client';

/**
 * This interceptor captures metrics for method invocations,
 * excluding sequence actions and middleware executed before
 * a method is invoked. Please collect metrics at other places
 * if you want to cover more than just method invocations.
 */
@bind(asGlobalInterceptor('metrics'), {scope: BindingScope.SINGLETON})
export class MetricsInterceptor implements Provider<Interceptor> {
  private static gauge: Gauge;

  private static histogram: Histogram;

  private static counter: Counter;

  private static summary: Summary;

  private static setup() {
    // Check if the gauge is registered
    if (
      this.gauge &&
      register.getSingleMetric('loopback_invocation_duration_seconds')
    )
      return;
    // The constructor will register the metric with the global registry
    this.gauge = new Gauge({
      name: 'loopback_invocation_duration_seconds',
      help: 'method invocation',
      labelNames: ['targetName'],
    });

    this.histogram = new Histogram({
      name: 'loopback_invocation_duration_histogram',
      help: 'method invocation histogram',
      labelNames: ['targetName'],
    });

    this.counter = new Counter({
      name: 'loopback_invocation_total',
      help: 'method invocation counts',
      labelNames: ['targetName'],
    });

    this.summary = new Summary({
      name: 'loopback_invocation_duration_summary',
      help: 'method invocation summary',
      labelNames: ['targetName'],
    });
  }

  constructor() {}

  value() {
    return this.intercept.bind(this);
  }

  async intercept<T>(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<T>,
  ) {
    MetricsInterceptor.setup();
    const endGauge = MetricsInterceptor.gauge.startTimer({
      targetName: invocationCtx.targetName,
    });
    const endHistogram = MetricsInterceptor.histogram.startTimer({
      targetName: invocationCtx.targetName,
    });
    const endSummary = MetricsInterceptor.summary.startTimer({
      targetName: invocationCtx.targetName,
    });
    try {
      MetricsInterceptor.counter.inc();
      return await next();
    } finally {
      endGauge();
      endHistogram();
      endSummary();
    }
  }
}
