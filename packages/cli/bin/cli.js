#!/usr/bin/env node
// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const assert = require('assert');
const camelCaseKeys = require('camelcase-keys');
const debug = require('debug')('loopback:cli');
const minimist = require('minimist');
const path = require('path');
const yeoman = require('yeoman-environment');

const opts = minimist(process.argv.slice(2), {
  alias: {
    help: 'h',
    version: 'v',
    commands: 'l',
  },
});

if (opts.version) {
  const ver = require('../package.json').version;
  console.log('Version: %s', ver);
  return;
}

var env = yeoman.createEnv();

env.register(path.join(__dirname, '../generators/app'), 'loopback4:app');
env.register(
  path.join(__dirname, '../generators/extension'),
  'loopback4:extension'
);
env.register(
  path.join(__dirname, '../generators/controller'),
  'loopback4:controller'
);

// list generators
if (opts.commands) {
  console.log('Available commands: ');
  var list = Object.keys(env.getGeneratorsMeta())
    .filter(name => /^loopback4:/.test(name))
    .map(name => name.replace(/^loopback4:/, '  lb4 '));
  console.log(list.join('\n'));
  return;
}

const args = opts._;
const originalCommand = args.shift();
let command = 'loopback4:' + (originalCommand || 'app');
const supportedCommands = env.getGeneratorsMeta();

if (!(command in supportedCommands)) {
  command = 'loopback4:app';
  args.unshift(originalCommand);
  args.unshift(command);
} else {
  args.unshift(command);
}

debug('invoking generator', args);

// `yo` is adding flags converted to CamelCase
const options = camelCaseKeys(opts, {exclude: ['--', /^\w$/, 'argv']});
Object.assign(options, opts);

debug('env.run %j %j', args, options);
env.run(args, options);
