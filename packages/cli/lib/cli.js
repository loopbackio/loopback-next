// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const camelCaseKeys = require('camelcase-keys');
const debug = require('./debug')();
const path = require('path');
const fs = require('fs-extra');
const yeoman = require('yeoman-environment');
const PREFIX = 'loopback4:';
const {printVersions} = require('./version-helper');

const {tabCompletionCommands} = require('./tab-completion');

/**
 * Parse arguments and run corresponding command
 * @param env - Yeoman env
 * @param {*} opts Command options
 * @param log - Log function
 */
function runCommand(env, opts, log) {
  const dryRun = opts.dryRun || opts['dry-run'];
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
  const prefix = '  lb4 ';
  const generatorCommands = Object.keys(env.getGeneratorsMeta())
    .filter(name => /^loopback4:/.test(name))
    .map(name => name.replace(/^loopback4:/, prefix));
  const completionCommands = tabCompletionCommands
    .filter(command => command !== 'completion')
    .map(command => `${prefix}${command}`);
  const list = [...generatorCommands, ...completionCommands];
  log(list.join('\n'));
}

const baseOptions = {
  help: {
    name: 'help',
    type: 'Boolean',
    alias: 'h',
    description: "Print the generator's options and usage",
  },
  'skip-cache': {
    name: 'skip-cache',
    type: 'Boolean',
    description: 'Do not remember prompt answers',
    default: false,
  },
  'skip-install': {
    name: 'skip-install',
    type: 'Boolean',
    description: 'Do not automatically install dependencies',
    default: false,
  },
  'force-install': {
    name: 'force-install',
    type: 'Boolean',
    description: 'Fail on install dependencies error',
    default: false,
  },
  'ask-answered': {
    type: 'Boolean',
    description: 'Show prompts for already configured options',
    default: false,
    name: 'ask-answered',
    hide: false,
  },
};

function main(opts, log) {
  const dryRun = opts.dryRun || opts['dry-run'];
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

  const yoJsonFile = path.join(__dirname, '../.yo-rc.json');
  if (opts.meta) {
    const optionsAndArgs = {
      base: baseOptions,
    };
    const meta = env.getGeneratorsMeta();
    for (const ns in meta) {
      const gen = env.create(ns, {options: {help: true}});
      const name = ns.substring('loopback4:'.length);
      const commandOptions = {};
      for (const n in gen._options) {
        const opt = gen._options[n];
        commandOptions[n] = {...opt, type: opt.type.name};
      }
      const commandArgs = [];
      for (const arg of gen._arguments) {
        commandArgs.push({...arg, type: arg.type.name});
      }
      optionsAndArgs[name] = {
        options: commandOptions,
        arguments: commandArgs,
        name,
      };
    }

    const yoJson = fs.readJsonSync(yoJsonFile);
    const str = JSON.stringify(yoJson.commands, null, 2);
    yoJson.commands = optionsAndArgs;
    if (str !== JSON.stringify(optionsAndArgs, null, 2)) {
      if (!dryRun) {
        fs.writeJsonSync(yoJsonFile, yoJson, {spaces: 2, encoding: 'utf-8'});
      }
      log('%s has been updated.', path.relative(process.cwd(), yoJsonFile));
    } else {
      log('%s is up to date.', path.relative(process.cwd(), yoJsonFile));
    }

    return optionsAndArgs;
  }

  runCommand(env, opts, log);
}

module.exports = main;
