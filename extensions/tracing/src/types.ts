// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-tracing
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TracingOptions} from 'jaeger-client';
export {TracingConfig, TracingOptions} from 'jaeger-client';

export const LOOPBACK_TRACE_ID = 'x-loopback-trace-id';

export const DEFAULT_TRACING_OPTIONS: TracingOptions = {};
