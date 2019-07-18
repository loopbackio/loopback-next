// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-tracing
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  bind,
  Component,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  config,
  ContextTags,
  CoreBindings,
  createBindingFromClass,
  inject,
} from '@loopback/core';
import {initTracerFromEnv} from 'jaeger-client';
import {TracingInterceptor} from './interceptors/tracing.interceptor';
import {TracingBindings} from './keys';
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
    const tracer = initTracerFromEnv(tracingConfig, {
      contextKey: LOOPBACK_TRACE_ID,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    this.application.bind(TracingBindings.TRACER).to(tracer);
    this.application.add(createBindingFromClass(TracingInterceptor));
  }
}
