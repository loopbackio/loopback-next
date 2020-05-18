// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/tracing
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  bind,
  Component,
  config,
  ContextTags,
  CoreBindings,
  inject,
} from '@loopback/core';
import {registerMiddleware} from '@loopback/rest';
import {NodeTracerProvider} from '@opentelemetry/node';
import {initTracerFromEnv} from 'jaeger-client';
import {TracingBindings} from './keys';
import {TracingMiddleware} from './middleware/tracing.middleware';
import {LOOPBACK_TRACE_ID, TracingConfig} from './types';

/**
 * A component providing tracing status
 */
@bind({tags: {[ContextTags.KEY]: TracingBindings.COMPONENT}})
export class TracingComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: Application,
    @config()
    tracingConfig: TracingConfig = {serviceName: 'loopback'},
  ) {
    setupNodeTraceProvider();

    const tracer = initTracerFromEnv(tracingConfig, {
      contextKey: LOOPBACK_TRACE_ID,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    this.application.bind(TracingBindings.TRACER).to(tracer);
    registerMiddleware(this.application, TracingMiddleware, {});
  }
}

function setupNodeTraceProvider() {
  const nodeTraceProvider = new NodeTracerProvider({
    plugins: {
      http: {
        enabled: true,
        // You may use a package name or absolute path to the file.
        path: '@opentelemetry/plugin-http',
      },
      https: {
        enabled: true,
        // You may use a package name or absolute path to the file.
        path: '@opentelemetry/plugin-https',
      },
    },
  });
  nodeTraceProvider.register();
}
