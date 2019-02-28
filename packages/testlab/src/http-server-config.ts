// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Create an HTTP-server configuration that works well in test environments.
 *  - Ask the operating system to assign a free (ephemeral) port.
 *  - Use IPv4 localhost `127.0.0.1` to avoid known IPv6 issues in Docker-based
 *    environments like Travis-CI.
 *
 * @param customConfig Additional configuration options to apply.
 */
export function givenHttpServerConfig<T extends object>(
  customConfig?: T,
): T & {host: string; port: number} {
  const defaults = {
    host: '127.0.0.1',
    port: 0,
  };
  const config = Object.assign({}, defaults, customConfig);
  if (config.host === undefined) config.host = defaults.host;
  if (config.port === undefined) config.port = defaults.port;
  return config;
}
