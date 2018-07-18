// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Helper function for generating Travis-friendly host (127.0.0.1)
 * @param options Optional defaults
 */
export function givenHttpServerConfig<T>(options?: T): T & {host?: string} {
  const defaults = process.env.TRAVIS ? {host: '127.0.0.1'} : {};
  return Object.assign(defaults, options);
}
