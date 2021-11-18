// Copyright IBM Corp. 2020,2021. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const { mergeMochaConfigs } = require('./packages/build');
const defaultConfig = require('./packages/build/config/.mocharc.json');

const MONOREPO_CONFIG = {
  parallel: true,
  timeout: 10000,
};

module.exports = mergeMochaConfigs(
  defaultConfig,
  MONOREPO_CONFIG,
  // Apply Mocha config from packages that require custom Mocha setup
  require('./packages/cli/.mocharc.js'),
);
