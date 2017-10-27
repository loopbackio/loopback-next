// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

exports.tsc = require('./bin/compile-package');
exports.prettier = require('./bin/run-prettier');
exports.tslint = require('./bin/run-tslint');
exports.nyc = require('./bin/run-nyc');
exports.dist = require('./bin/select-dist');
