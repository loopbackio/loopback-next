// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const debug = require('debug');

/**
 * Returns a debug function whose prefix is automatically scoped to
 * "loopback:cli:{scope}". If no scope is provided, it will be scoped
 * to "loopback:cli".
 * @param {String=} scope The scope to use for the debug statement.
 */
module.exports = function (scope) {
  return debug(`loopback:cli${scope ? `:${scope}` : ''}`);
};
