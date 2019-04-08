#!/usr/bin/env node
// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const pkg = require('../package.json');
const semver = require('semver');

// Make sure node version meets the requirement. This code intentionally only
// uses ES5 features so that it can be run with lower versions of Node
// to report the version requirement.
const nodeVer = process.versions.node;
const requiredVer = pkg.engines.node;
const ok = semver.satisfies(nodeVer, requiredVer);
if (!ok) {
  const format = 'Node.js %s is not supported. Please use a version %s.';
  console.error(format, nodeVer, requiredVer);
  process.exit(1);
}

// Intentionally have a separate `main.js` which can use JS features
// supported by required version of Node
const minimist = require('minimist');
const main = require('../lib/cli');
const opts = minimist(process.argv.slice(2), {
  alias: {
    version: 'v', // --version or -v: print versions
    commands: 'l', // --commands or -l: print commands
  },
});

const updateNotifier = require('update-notifier');
// Force version check with `lb4 --version`
const interval = opts.version ? 0 : undefined;
updateNotifier({
  pkg: pkg,
  updateCheckInterval: interval,
}).notify({isGlobal: true});

main(opts);
