// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-tracing
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {Span, Tracer} from 'opentracing';
import {TracingComponent} from './tracing.component';
import {TracingConfig} from './types';

/**
 * Binding keys used by this component.
 */
export namespace TracingBindings {
  export const COMPONENT = BindingKey.create<TracingComponent>(
    'components.TracingComponent',
  );

  export const CONFIG = BindingKey.buildKeyForConfig<TracingConfig>(
    COMPONENT.key,
  );

  export const TRACER = BindingKey.create<Tracer>('tracing.tracer');

  export const SPAN = BindingKey.create<Span>('tracing.span');
}

/**
 * Binding tags for tracing related services
 */
export namespace TracingTags {}
