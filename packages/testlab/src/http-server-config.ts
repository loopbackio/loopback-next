// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {readFileSync} from 'fs';
import {ServerOptions as HttpsServerOptions} from 'https';
import {ListenOptions} from 'net';
import * as path from 'path';

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

export type HostPort = {
  host: string;
  port: number;
};

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
  const defaults = {
    host: '127.0.0.1',
    port: 0,
    protocol: undefined,
  };
  const config = Object.assign({}, defaults, customConfig);
  if (config.host === undefined) config.host = defaults.host;
  if (config.port === undefined) config.port = defaults.port;
  if (isHttpsConfig(config)) {
    setupTlsConfig(config);
  }
  return config;
}

function setupTlsConfig(config: HttpsServerOptions) {
  if ('key' in config && 'cert' in config) return;
  if ('pfx' in config) return;
  Object.assign(config, DUMMY_TLS_CONFIG);
}

function isHttpsConfig(
  config: HttpOptions | HttpsOptions,
): config is HttpsOptions {
  return config && config.protocol === 'https';
}
