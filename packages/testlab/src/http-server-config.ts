// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Create an HTTP-server configuration that works well in test environments.
 *  - Ask the operating system to assign a free (ephemeral) port.
 *  - Use IPv4 localhost `127.0.0.1` on Travis-CI to avoid known IPv6 issues.
 *
 * @param customConfig Additional configuration options to apply.
 */
export function givenHttpServerConfig<T extends object>(
  customConfig?: T,
): T & {host?: string; port: number} {
  const defaults = {port: 0};
  const hostConfig = process.env.TRAVIS ? {host: '127.0.0.1'} : {};
  return Object.assign(defaults, hostConfig, customConfig);
}
