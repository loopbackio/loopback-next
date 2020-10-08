// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// A workaround to use `--require ./test/snapshot-matcher.js` so that root
// hooks are executed by mocha parallel testing for each job

const debug = require('debug')('loopback:cli:test');
const {mergeMochaConfigs} = require('@loopback/build');

// Start with the default config from `@loopback/build`
const defaultConfig = require('@loopback/build/config/.mocharc.js');
debug('Default mocha config:', defaultConfig);

// Resolve `./test/snapshot-matcher.js` to get the absolute path
const mochaHooksFile = require.resolve('./test/snapshot-matcher.js');
debug('Root hooks for --require %s', mochaHooksFile);

// Custom configuration for CLI tests
const CLI_MOCHA_CONFIG = {
  timeout: 5000,
  require: mochaHooksFile,
};

const config = mergeMochaConfigs(defaultConfig, CLI_MOCHA_CONFIG);
debug('Final mocha config:', config);

module.exports = config;
