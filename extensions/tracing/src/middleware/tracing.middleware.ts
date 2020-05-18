// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/tracing
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, Provider, ValueOrPromise} from '@loopback/core';
import {asMiddleware, Middleware, MiddlewareContext} from '@loopback/express';
import openTelemetry, {propagation, Tracer} from '@opentelemetry/api';
import {JaegerExporter} from '@opentelemetry/exporter-jaeger';
import {BasicTracerProvider, SimpleSpanProcessor} from '@opentelemetry/tracing';
import debugFactory from 'debug';
import {TracingBindings} from '../keys';

const debug = debugFactory('loopback:tracing');

@bind(asMiddleware({group: 'tracing'}))
export class TracingMiddleware implements Provider<Middleware> {
  private tracer: Tracer;

  constructor() {
    const provider = new BasicTracerProvider();

    // Configure span processor to send spans to the exporter
    const exporter = new JaegerExporter({serviceName: 'basic-service'});
    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

    /**
     * Initialize the OpenTelemetry APIs to use the BasicTracerProvider bindings.
     *
     * This registers the tracer provider with the OpenTelemetry API as the global
     * tracer provider. This means when you call API methods like
     * `opentelemetry.trace.getTracer`, they will use this tracer provider. If you
     * do not register a global tracer provider, instrumentation which calls these
     * methods will recieve no-op implementations.
     */
    provider.register();
    this.tracer = openTelemetry.trace.getTracer('loopback:tracer');
  }

  value() {
    return this.intercept.bind(this);
  }

  async intercept<T>(reqCtx: MiddlewareContext, next: () => ValueOrPromise<T>) {
    let reqSpanCtx = propagation.extract(
      FORMAT_HTTP_HEADERS,
      reqCtx.request.headers,
    );
    debug('Extracted span context: %s', reqSpanCtx);
    let span;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!reqSpanCtx || !(reqSpanCtx as any).traceId) {
      span = this.tracer.startSpan(reqCtx.targetName);
      reqSpanCtx = span.context();
      debug('Inject a new span context: %s', reqSpanCtx);
      this.tracer.inject(
        reqSpanCtx,
        FORMAT_HTTP_HEADERS,
        reqCtx.request.headers,
      );
    } else {
      const parentSpan = reqCtx.getSync(TracingBindings.SPAN, {
        optional: true,
      });
      span = this.tracer.startSpan(reqCtx.targetName, {
        references: [followsFrom(parentSpan?.context() ?? reqSpanCtx)],
      });
      if (debug.enabled) debug('A new span is started: %s', span.context());
    }
    debug('Span context at %s: %s', reqCtx.targetName, reqSpanCtx);

    try {
      reqCtx.bind(TracingBindings.SPAN).to(span);
      return await next();
    } finally {
      span.finish();
      if (debug.enabled) debug('The span is finished: %s', span.context());
    }
  }
}
