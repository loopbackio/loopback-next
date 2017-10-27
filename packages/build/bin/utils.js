// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const util = require('util');
const fs = require('fs');
const path = require('path');
const spawn = require('cross-spawn');
const debug = require('debug')('loopback:build');

/**
 * Get the Node.js compilation target - es2017 or es2015
 */
function getCompilationTarget() {
  const nodeMajorVersion = +process.versions.node.split('.')[0];
  return nodeMajorVersion >= 7 ? 'es2017' : 'es2015';
}

/**
 * Get the distribution name
 * @param {*} target
 */
function getDistribution(target) {
  if (!target) {
    target = getCompilationTarget();
  }
  var dist;
  switch (target) {
    case 'es2017':
      dist = 'dist';
      break;
    case 'es2015':
      dist = 'dist6';
      break;
    default:
      console.error(
        'Unknown build target %s. Supported values: es2015, es2017'
      );
      process.exit(1);
  }
  return dist;
}

/**
 * Get the root directory of this module
 */
function getRootDir() {
  return path.resolve(__dirname, '..');
}

/**
 * Get the root directory of the npm package
 */
function getPackageDir() {
  return process.cwd();
}

/**
 * Get config file
 * @param {string} name Preferred file
 * @param {string} defaultName Default file
 */
function getConfigFile(name, defaultName) {
  var dir = getPackageDir();
  var configFile = path.join(dir, name);
  if (!fs.existsSync(configFile)) {
    if (defaultName) {
      configFile = path.join(dir, name);
      if (!fs.existsSync(configFile)) {
        configFile = path.join(getRootDir(), 'config/' + name);
      }
    } else {
      // Fall back to config/
      configFile = path.join(getRootDir(), 'config/' + name);
    }
  }
  return configFile;
}

/**
 * Resolve the path of the cli command
 * @param {string} cli
 */
function resolveCLI(cli) {
  const path = './node_modules/' + cli;
  try {
    return require.resolve(path.join(getPackageDir(), path));
  } catch (e) {
    return require.resolve(cli);
  }
}

/**
 * Run a command with the given arguments
 * @param {string} cli Path of the cli command
 * @param {string[]} args The arguments
 * @param {boolean} dryRun Controls if the cli will be executed or not. If set
 * to true, the command itself will be returned without running it
 */
function runCLI(cli, args, dryRun) {
  cli = resolveCLI(cli);
  args = [cli].concat(args);
  debug('%s', args.join(' '));
  if (dryRun) {
    return util.format('%s %s', process.execPath, args.join(' '));
  }
  var child = spawn(
    process.execPath, // Typically '/usr/local/bin/node'
    args,
    {
      stdio: 'inherit',
      env: Object.create(process.env),
    }
  );
  child.on('close', (code, signal) => {
    debug('%s exits: %d', cli, code);
    process.exitCode = code;
  });
  return child;
}

/**
 * Run the command in a shell
 * @param {string} command The command
 * @param {string[]} args The arguments
 * @param {boolean} dryRun Controls if the cli will be executed or not. If set
 * to true, the command itself will be returned without running it
 */
function runShell(command, args, dryRun) {
  args = args.map(a => JSON.stringify(a));
  debug('%s %s', command, args.join(' '));
  if (dryRun) {
    return util.format('%s %s', command, args.join(' '));
  }
  var child = spawn(command, args, {
    stdio: 'inherit',
    env: Object.create(process.env),
    // On Windows, npm creates `.cmd` files instead of symlinks in
    // `node_modules/.bin` folder. These files cannot be executed directly,
    // only via a shell.
    shell: true,
  });
  child.on('close', (code, signal) => {
    debug('%s exits: %d', command, code);
    process.exitCode = code;
  });
  return child;
}

/**
 * Check if one of the option names is set by the opts
 * @param {string[]} opts
 * @param {string[]} optionNames
 */
function isOptionSet(opts, ...optionNames) {
  return opts.some(o => optionNames.indexOf(o) !== -1);
}

exports.getCompilationTarget = getCompilationTarget;
exports.getDistribution = getDistribution;
exports.getRootDir = getRootDir;
exports.getPackageDir = getPackageDir;
exports.getConfigFile = getConfigFile;
exports.resolveCLI = resolveCLI;
exports.runCLI = runCLI;
exports.runShell = runShell;
exports.isOptionSet = isOptionSet;
