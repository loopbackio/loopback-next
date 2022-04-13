// Copyright IBM Corp. and LoopBack contributors 2017,2020. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const debug = require('debug')('loopback:build:merge-mocha-configs');
const {assignWith} = require('lodash');

module.exports = mergeMochaConfigs;

/**
 * Merge multiple Mocha configuration files into a single one.
 *
 * @param {MochaConfig[]} configs A list of Mocha configuration objects
 * as provided by `.mocharc.js` files.
 */
function mergeMochaConfigs(...configs) {
  debug('Merging mocha configurations', ...configs);
  const result = assignWith({}, ...configs, assignMochaConfigEntry);
  debug('Merged config:', result);
  return result;
}

function assignMochaConfigEntry(targetValue, sourceValue, key) {
  switch (key) {
    case 'timeout':
      return Math.max(targetValue || 0, sourceValue);
    case 'require':
      if (Array.isArray(sourceValue)) {
        debug('Adding an array of files to require:', sourceValue);
        return [...(targetValue || []), ...sourceValue];
      } else {
        debug('Adding a single file to require:', sourceValue);
        return [...(targetValue || []), sourceValue];
      }
  }
}
