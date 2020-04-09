// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli-core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import debugFactory from 'debug';

/**
 * Returns a debug function whose prefix is automatically scoped to
 * "loopback:cli:{scope}". If no scope is provided, it will be scoped
 * to "loopback:cli".
 * @param scope - The scope to use for the debug statement.
 */
export function getDebug(scope = '') {
  return debugFactory(`loopback:cli${scope ? `:${scope}` : ''}`);
}
