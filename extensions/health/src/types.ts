// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/health
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Options for health component
 */
export type HealthOptions = {
  disabled?: boolean;
  healthPath: string;
  readyPath: string;
  livePath: string;
  openApiSpec?: boolean;
};

/**
 * Configuration for health component with optional properties
 */
export type HealthConfig = Partial<HealthOptions>;

export const DEFAULT_HEALTH_OPTIONS: HealthOptions = {
  healthPath: '/health',
  readyPath: '/ready',
  livePath: '/live',
  openApiSpec: false,
};

/**
 * Functions for liveness check
 */
export type LiveCheck = () => Promise<void>;

/**
 * Functions for readiness check
 */
export type ReadyCheck = () => Promise<void>;
