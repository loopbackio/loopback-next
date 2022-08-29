// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import assert from 'assert';
import {readFileSync} from 'fs';
import {ServerOptions as HttpsServerOptions} from 'https';
import {ListenOptions} from 'net';
import path from 'path';

const FIXTURES = path.resolve(__dirname, '../fixtures');
const DUMMY_TLS_CONFIG = {
  key: readFileSync(path.join(FIXTURES, 'key.pem')),
  cert: readFileSync(path.join(FIXTURES, 'cert.pem')),
};

export interface HttpOptions extends ListenOptions {
  protocol?: 'http';
}

export interface HttpsOptions extends ListenOptions, HttpsServerOptions {
  protocol: 'https';
}

/**
 * An object that requires host and port properties
 */
export interface HostPort {
  host: string;
  port: number;
}

/**
 * Assertion type guard for TypeScript to ensure `host` and `port` are set
 * @param config - Host/port configuration
 */
function assertHostPort(config: Partial<HostPort>): asserts config is HostPort {
  assert(config.host != null, 'host is not set');
  assert(config.port != null, 'port is not set');
}

/**
 * Create an HTTP-server configuration that works well in test environments.
 *  - Ask the operating system to assign a free (ephemeral) port.
 *  - Use IPv4 localhost `127.0.0.1` to avoid known IPv6 issues in Docker-based
 *    environments like Travis-CI.
 *  - Provide default TLS key & cert when `protocol` is set to `https`.
 *
 * @param customConfig - Additional configuration options to apply.
 */
export function givenHttpServerConfig<T extends HttpOptions | HttpsOptions>(
  customConfig?: T,
): HostPort & T {
  const defaults: HostPort = {host: '127.0.0.1', port: 0};

  if (isHttpsConfig(customConfig)) {
    const config: T = {...customConfig};
    if (config.host == null) config.host = defaults.host;
    if (config.port == null) config.port = defaults.port;
    setupTlsConfig(config as HttpsOptions);
    assertHostPort(config);
    return config;
  }

  assertHttpConfig(customConfig);
  const config: T = {...customConfig};
  if (config.host == null) config.host = defaults.host;
  if (config.port == null) config.port = defaults.port;
  assertHostPort(config);
  return config;
}

function setupTlsConfig(config: HttpsServerOptions) {
  if ('key' in config && 'cert' in config) return;
  if ('pfx' in config) return;
  Object.assign(config, DUMMY_TLS_CONFIG);
}

/**
 * Type guard to check if the parameter is `HttpsOptions`
 */
function isHttpsConfig(
  config?: HttpOptions | HttpsOptions,
): config is HttpsOptions {
  return config?.protocol === 'https';
}

/**
 * Type guard to assert the parameter is `HttpOptions`
 * @param config - Http config
 */
function assertHttpConfig(
  config?: HttpOptions | HttpsOptions,
): asserts config is HttpOptions {
  assert(config?.protocol == null || config?.protocol === 'http');
}
