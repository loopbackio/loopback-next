// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as path from 'path';
import {readFileSync} from 'fs';
import {ServerOptions as HttpsServerOptions} from 'https';

const FIXTURES = path.resolve(__dirname, '../fixtures');
const DUMMY_TLS_CONFIG = {
  key: readFileSync(path.join(FIXTURES, 'key.pem')),
  cert: readFileSync(path.join(FIXTURES, 'cert.pem')),
};

export type ConfigRetval<T extends object> = T & {
  host: string;
  port: number;
} & HttpsServerOptions;

/**
 * Create an HTTP-server configuration that works well in test environments.
 *  - Ask the operating system to assign a free (ephemeral) port.
 *  - Use IPv4 localhost `127.0.0.1` to avoid known IPv6 issues in Docker-based
 *    environments like Travis-CI.
 *  - Provide default TLS key & cert when `protocol` is set to `https`.
 *
 * @param customConfig - Additional configuration options to apply.
 */
export function givenHttpServerConfig<T extends object>(
  customConfig?: T & {protocol?: string},
): ConfigRetval<T> {
  const defaults = {
    host: '127.0.0.1',
    port: 0,
    protocol: undefined,
  };
  const config: ConfigRetval<T> = Object.assign({}, defaults, customConfig);
  if (config.host === undefined) config.host = defaults.host;
  if (config.port === undefined) config.port = defaults.port;
  if (customConfig && customConfig.protocol === 'https') {
    setupTlsConfig(config);
  }
  return config;
}

function setupTlsConfig(config: HttpsServerOptions) {
  if ('key' in config && 'cert' in config) return;
  if ('pfx' in config) return;
  Object.assign(config, DUMMY_TLS_CONFIG);
}
