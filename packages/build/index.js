// Copyright IBM Corp. and LoopBack contributors 2017,2020. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

exports.tsc = require('./bin/compile-package');
exports.prettier = require('./bin/run-prettier');
exports.nyc = require('./bin/run-nyc');
exports.mocha = require('./bin/run-mocha');
exports.clean = require('./bin/run-clean');

const utils = require('./bin/utils');
exports.runCLI = utils.runCLI;
exports.runShell = utils.runShell;

const path = require('path');
exports.typeScriptPath = path.resolve(
  require.resolve('typescript/package.json'),
  '..',
);

exports.mergeMochaConfigs = require('./src/merge-mocha-configs');
