// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/metrics
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  asGlobalInterceptor,
  BindingScope,
  injectable,
  Interceptor,
  InvocationContext,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import {HttpErrors, RequestContext, Response} from '@loopback/rest';
import {
  Counter,
  Gauge,
  Histogram,
  LabelValues,
  register,
  Summary,
} from 'prom-client';

type LabelNames = 'targetName' | 'method' | 'path' | 'statusCode';

const labelNames: LabelNames[] = ['targetName', 'method', 'path', 'statusCode'];

/**
 * This interceptor captures metrics for method invocations,
 * excluding sequence actions and middleware executed before
 * a method is invoked. Please collect metrics at other places
 * if you want to cover more than just method invocations.
 */
@injectable(asGlobalInterceptor('metrics'), {scope: BindingScope.SINGLETON})
export class MetricsInterceptor implements Provider<Interceptor> {
  private static gauge: Gauge<LabelNames>;

  private static histogram: Histogram<LabelNames>;

  private static counter: Counter<LabelNames>;

  private static summary: Summary<LabelNames>;

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
      labelNames,
    });

    this.histogram = new Histogram({
      name: 'loopback_invocation_duration_histogram',
      help: 'method invocation histogram',
      labelNames,
    });

    this.counter = new Counter({
      name: 'loopback_invocation_total',
      help: 'method invocation count',
      labelNames,
    });

    this.summary = new Summary({
      name: 'loopback_invocation_duration_summary',
      help: 'method invocation summary',
      labelNames,
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
    const {request, response} = invocationCtx.parent as RequestContext;
    const labelValues: LabelValues<LabelNames> = {
      targetName: invocationCtx.targetName,
      method: request.method,
      path: request.path,
    };
    const endGauge = MetricsInterceptor.gauge.startTimer();
    const endHistogram = MetricsInterceptor.histogram.startTimer();
    const endSummary = MetricsInterceptor.summary.startTimer();
    try {
      const result = await next();
      labelValues.statusCode = getStatusCodeFromResponse(response, result);
      return result;
    } catch (err) {
      labelValues.statusCode = getStatusCodeFromError(err);
      throw err;
    } finally {
      MetricsInterceptor.counter.inc(labelValues);
      endGauge(labelValues);
      endHistogram(labelValues);
      endSummary(labelValues);
    }
  }
}

function getStatusCodeFromResponse(response: Response, result?: unknown) {
  // interceptors are invoked before result is written to response,
  // the status code for 200 responses without a result should be 204
  const noContent = response.statusCode === 200 && result === undefined;
  return noContent ? 204 : response.statusCode;
}

function getStatusCodeFromError(err: HttpErrors.HttpError) {
  // interceptors are invoked before error is written to response,
  // it is required to retrieve the status code from the error
  const notFound = err.code === 'ENTITY_NOT_FOUND';
  return err.statusCode ?? err.status ?? (notFound ? 404 : 500);
}
