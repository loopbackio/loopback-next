// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const {mergeMochaConfigs} = require('./packages/build');
const defaultConfig = require('./packages/build/config/.mocharc.json');

module.exports = mergeMochaConfigs(
  defaultConfig,
  // Apply Mocha config from packages that require custom Mocha setup
  require('./packages/cli/.mocharc.js'),
);
