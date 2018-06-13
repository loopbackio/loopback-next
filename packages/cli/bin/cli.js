#!/usr/bin/env node
// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const assert = require('assert');
const camelCaseKeys = require('camelcase-keys');
const debug = require('../lib/debug')();
const minimist = require('minimist');
const path = require('path');
const yeoman = require('yeoman-environment');
const PREFIX = 'loopback4:';

/**
 * Parse arguments and run corresponding command
 * @param env Yeoman env
 * @param {*} opts Command options
 * @param log Log function
 * @param dryRun flag for dryRun (for testing)
 */
function runCommand(env, opts, log, dryRun) {
  const args = opts._;
  const originalCommand = args.shift();
  let command = PREFIX + (originalCommand || 'app');
  const supportedCommands = env.getGeneratorsMeta();
  if (!(command in supportedCommands)) {
    command = PREFIX + 'app';
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
  if (!dryRun) {
    env.run(args, options);
  }
  // list generators
  if (opts.help && !originalCommand) {
    printCommands(env, log);
  }
}

/**
 * Set up yeoman generators
 */
function setupGenerators() {
  var env = yeoman.createEnv();
  env.register(path.join(__dirname, '../generators/app'), PREFIX + 'app');
  env.register(
    path.join(__dirname, '../generators/extension'),
    PREFIX + 'extension',
  );
  env.register(
    path.join(__dirname, '../generators/controller'),
    PREFIX + 'controller',
  );
  env.register(
    path.join(__dirname, '../generators/datasource'),
    PREFIX + 'datasource',
  );
  env.register(
    path.join(__dirname, '../generators/example'),
    PREFIX + 'example',
  );
  return env;
}

/**
 * Print @loopback/* versions
 */
function printVersions(log) {
  const pkg = require('../package.json');
  const ver = pkg.version;
  log('@loopback/cli version: %s', ver);
  const deps = pkg.config.templateDependencies;
  log('\n@loopback/* dependencies:');
  for (const d in deps) {
    if (d.startsWith('@loopback/') && d !== '@loopback/cli') {
      log('  - %s: %s', d, deps[d]);
    }
  }
}

/**
 * Print a list of available commands
 * @param {*} env Yeoman env
 * @param log Log function
 */
function printCommands(env, log) {
  log('Available commands: ');
  var list = Object.keys(env.getGeneratorsMeta())
    .filter(name => /^loopback4:/.test(name))
    .map(name => name.replace(/^loopback4:/, '  lb4 '));
  log(list.join('\n'));
}

function main(opts, log, dryRun) {
  log = log || console.log;
  if (opts.version) {
    printVersions(log);
    return;
  }

  var env = setupGenerators();

  // list generators
  if (opts.commands) {
    printCommands(env, log);
    return;
  }

  runCommand(env, opts, log, dryRun);
}

module.exports = main;

if (require.main === module) {
  const opts = minimist(process.argv.slice(2), {
    alias: {
      version: 'v', // --version or -v: print versions
      commands: 'l', // --commands or -l: print commands
    },
  });
  main(opts);
}
