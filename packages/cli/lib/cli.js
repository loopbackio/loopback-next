// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const camelCaseKeys = require('camelcase-keys');
const debug = require('./debug')();
const path = require('path');
const yeoman = require('yeoman-environment');
const PREFIX = 'loopback4:';
const {printVersions} = require('./version-helper');

/**
 * Parse arguments and run corresponding command
 * @param env - Yeoman env
 * @param {*} opts Command options
 * @param log - Log function
 * @param dryRun - flag for dryRun (for testing)
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
  const env = yeoman.createEnv();
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
    path.join(__dirname, '../generators/import-lb3-models'),
    PREFIX + 'import-lb3-models',
  );
  env.register(path.join(__dirname, '../generators/model'), PREFIX + 'model');
  env.register(
    path.join(__dirname, '../generators/repository'),
    PREFIX + 'repository',
  );
  env.register(
    path.join(__dirname, '../generators/service'),
    PREFIX + 'service',
  );
  env.register(
    path.join(__dirname, '../generators/example'),
    PREFIX + 'example',
  );
  env.register(
    path.join(__dirname, '../generators/openapi'),
    PREFIX + 'openapi',
  );
  env.register(
    path.join(__dirname, '../generators/observer'),
    PREFIX + 'observer',
  );
  env.register(
    path.join(__dirname, '../generators/interceptor'),
    PREFIX + 'interceptor',
  );
  env.register(
    path.join(__dirname, '../generators/discover'),
    PREFIX + 'discover',
  );
  env.register(
    path.join(__dirname, '../generators/relation'),
    PREFIX + 'relation',
  );
  env.register(path.join(__dirname, '../generators/update'), PREFIX + 'update');
  env.register(
    path.join(__dirname, '../generators/relation'),
    PREFIX + 'relation',
  );
  env.register(
    path.join(__dirname, '../generators/rest-crud'),
    PREFIX + 'rest-crud',
  );
  env.register(
    path.join(__dirname, '../generators/copyright'),
    PREFIX + 'copyright',
  );
  return env;
}

/**
 * Print a list of available commands
 * @param {*} env Yeoman env
 * @param log - Log function
 */
function printCommands(env, log) {
  log('Available commands:');
  const list = Object.keys(env.getGeneratorsMeta())
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

  const env = setupGenerators();

  // list generators
  if (opts.commands) {
    printCommands(env, log);
    return;
  }

  runCommand(env, opts, log, dryRun);
}

module.exports = main;
