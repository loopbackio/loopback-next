// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-metrics
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DefaultMetricsCollectorConfiguration} from 'prom-client';

export interface MetricsOptions {
  endpoint?: {
    disabled?: boolean;
    basePath?: string;
  };

  defaultMetrics?: {
    disabled?: boolean;
  } & DefaultMetricsCollectorConfiguration;

  pushGateway?: {
    disabled?: boolean;
    url: string;
    interval?: number;
  };
}

export const DEFAULT_METRICS_OPTIONS: MetricsOptions = {
  endpoint: {
    basePath: '/metrics',
  },
  defaultMetrics: {
    timeout: 5000,
  },
};
