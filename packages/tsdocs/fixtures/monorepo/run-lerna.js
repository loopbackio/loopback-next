#!/usr/bin/env node
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/tsdocs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * An internal script to run lerna command
 */
const path = require('path');
const lerna = path.resolve(__dirname, '../../../../node_modules/.bin/lerna');

const runShell = require('@loopback/build').runShell;
const child = runShell(lerna, process.argv.splice(2), {
  cwd: __dirname,
});
child.on('exit', code => {
  process.exit(code);
});
