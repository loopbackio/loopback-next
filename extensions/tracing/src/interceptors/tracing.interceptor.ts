// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-tracing
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  asGlobalInterceptor,
  bind,
  inject,
  Interceptor,
  InvocationContext,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import {RequestContext, RestBindings} from '@loopback/rest';
import * as debugFactory from 'debug';
import {followsFrom, FORMAT_HTTP_HEADERS, Tracer} from 'opentracing';
import {TracingBindings} from '../keys';
const debug = debugFactory('loopback:tracing');

@bind(asGlobalInterceptor('tracing'))
export class TracingInterceptor implements Provider<Interceptor> {
  constructor(@inject(TracingBindings.TRACER) private tracer: Tracer) {}

  value() {
    return this.intercept.bind(this);
  }

  async intercept<T>(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<T>,
  ) {
    const reqCtx = invocationCtx.getSync<RequestContext>(
      RestBindings.Http.CONTEXT,
    );
    let reqSpanCtx = this.tracer.extract(
      FORMAT_HTTP_HEADERS,
      reqCtx.request.headers,
    );
    debug('Extracted span context: %s', reqSpanCtx);
    let span;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!reqSpanCtx || !(reqSpanCtx as any).traceId) {
      span = this.tracer.startSpan(invocationCtx.targetName);
      reqSpanCtx = span.context();
      debug('Inject a new span context: %s', reqSpanCtx);
      this.tracer.inject(
        reqSpanCtx,
        FORMAT_HTTP_HEADERS,
        reqCtx.request.headers,
      );
    } else {
      const parentSpan = invocationCtx.getSync(TracingBindings.SPAN, {
        optional: true,
      });
      span = this.tracer.startSpan(invocationCtx.targetName, {
        references: [
          followsFrom((parentSpan && parentSpan.context()) || reqSpanCtx),
        ],
      });
      if (debug.enabled) debug('A new span is started: %s', span.context());
    }
    debug('Span context at %s: %s', invocationCtx.targetName, reqSpanCtx);

    try {
      invocationCtx.bind(TracingBindings.SPAN).to(span);
      return await next();
    } finally {
      span.finish();
      if (debug.enabled) debug('The span is finished: %s', span.context());
    }
  }
}
