#!/usr/bin/env node
// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const checkNodeVersion = require('@loopback/dist-util').checkNodeVersion;

const pkg = require('../package.json');
try {
  const range = pkg.engines.node;
  checkNodeVersion(range);
} catch (e) {
  console.error(e.message);
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
