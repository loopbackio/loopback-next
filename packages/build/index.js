// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

exports.tsc = require('./bin/compile-package');
exports.prettier = require('./bin/run-prettier');
exports.tslint = require('./bin/run-tslint');
exports.nyc = require('./bin/run-nyc');
exports.dist = require('./bin/select-dist');
exports.mocha = require('./bin/run-mocha');
exports.clean = require('./bin/run-clean');

const utils = require('./bin/utils');
exports.runCLI = utils.runCLI;
exports.runShell = utils.runShell;
