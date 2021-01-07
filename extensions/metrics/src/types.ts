// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/metrics
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DefaultMetricsCollectorConfiguration} from 'prom-client';

/**
 * Options for metrics component
 */
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
    jobName?: string;
    groupingKey?: {
      [key: string]: string;
    };
    replaceAll?: boolean;
  };

  openApiSpec?: boolean;

  defaultLabels?: {
    [labelName: string]: string;
  };
}

/**
 * Configuration for metrics component with optional properties
 */
export type MetricsConfig = Partial<MetricsOptions>;

export const DEFAULT_METRICS_OPTIONS: MetricsOptions = {
  endpoint: {
    basePath: '/metrics',
  },
  defaultMetrics: {},
  openApiSpec: false,
};
