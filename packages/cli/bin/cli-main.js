#!/usr/bin/env node
// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const pkg = require('../package.json');
const semver = require('semver');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const {
  tabCompletionCommands,
  runTabCompletionCommand,
} = require('../lib/tab-completion');

// Make sure node version meets the requirement. This code intentionally only
// uses ES5 features so that it can be run with lower versions of Node
// to report the version requirement.
const nodeVer = process.versions.node;
const requiredVer = pkg.engines.node;
const ok = semver.satisfies(nodeVer, requiredVer);
if (!ok) {
  const format =
    'Node.js "%s" is not supported. Please use a version that satisfies "%s".';
  console.warn(chalk.red(format), nodeVer, requiredVer);
}

// Intentionally have a separate `main.js` which can use JS features
// supported by required version of Node
const minimist = require('minimist');
const opts = minimist(process.argv.slice(2), {
  alias: {
    version: 'v', // --version or -v: print versions
    commands: 'l', // --commands or -l: print commands
    help: 'h', // --help or -h: help
  },
});

const args = opts._;

const originalCommand = args[0];
if (tabCompletionCommands.includes(originalCommand)) {
  const yoJsonFile = path.join(__dirname, '../.yo-rc.json');
  const config = fs.readJsonSync(yoJsonFile);
  return runTabCompletionCommand(config.commands, originalCommand, console.log);
}

const main = require('../lib/cli');
const updateNotifier = require('update-notifier');
// Force version check with `lb4 --version`
const interval = opts.version ? 0 : undefined;
updateNotifier({
  pkg: pkg,
  updateCheckInterval: interval,
}).notify({isGlobal: true});

main(opts);
