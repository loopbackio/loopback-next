// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// A workaround to use `--require ./test/snapshot-matcher.js` so that root
// hooks are executed by mocha parallel testing for each job

const debug = require('debug')('loopback:cli:test');

/**
 * Build mocha config for `@loopback/cli`
 */
function buildConfig() {
  // Use the default config from `@loopback/build`
  const mochaConfig = require('@loopback/build/config/.mocharc.json');
  debug('Default mocha config:', mochaConfig);
  // Resolve `./test/snapshot-matcher.js` to get the absolute path
  const mochaHooksFile = require.resolve('./test/snapshot-matcher.js');
  debug('Root hooks for --require %s', mochaHooksFile);
  const config = {...mochaConfig, timeout: 5000};

  // Allow env var `MOCHA_JOBS` to override parallel testing parameters
  const jobs = +process.env.MOCHA_JOBS;
  if (jobs === 0) {
    // Disable parallel testing
    config.parallel = false;
  } else if (jobs > 0) {
    // Override the default number of concurrent jobs
    config.parallel = true;
    config.jobs = jobs;
  }
  addRequire(config, mochaHooksFile);
  debug('Final mocha config:', config);
  return config;
}

/**
 * Add a new entry to the mocha config.require
 * @param {object} config - Mocha config
 * @param {string} mochaHooksFile - A module to be loaded by mocha
 */
function addRequire(config, mochaHooksFile) {
  if (typeof config.require === 'string') {
    config.require = [config.require, mochaHooksFile];
  } else if (Array.isArray(config.require)) {
    config.require = config.require.concat(mochaHooksFile);
  } else {
    config.require = mochaHooksFile;
  }
}

module.exports = buildConfig();
