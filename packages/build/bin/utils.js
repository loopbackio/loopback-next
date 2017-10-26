// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;

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
 * @param {*} name 
 */
function getConfigFile(name) {
  var dir = getPackageDir();
  var configFile = path.join(dir, name);
  if (!fs.existsSync(configFile)) {
    // Fall back to config/
    configFile = path.join(getRootDir(), 'config/' + name);
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
 */
function runCLI(cli, args) {
  cli = resolveCLI(cli);
  args = [cli].concat(args);
  console.log('%s', args.join(' '));
  var child = spawn(
    process.execPath, // Typically '/usr/local/bin/node'
    args,
    {
      stdio: 'inherit',
    }
  );
  child.on('close', (number, signal) => (process.exitCode = number));
  return child;
}

/**
 * Run the command in a shell
 * @param {string} command The command
 * @param {string[]} args The arguments
 */
function runShell(command, args) {
  console.log('%s %s', command, args.join(' '));
  var child = spawn(command, args, {
    stdio: 'inherit',
    // On Windows, npm creates `.cmd` files instead of symlinks in
    // `node_modules/.bin` folder. These files cannot be executed directly,
    // only via a shell.
    shell: true,
  });
  child.on('close', (number, signal) => (process.exitCode = number));
  return child;
}

exports.getCompilationTarget = getCompilationTarget;
exports.getDistribution = getDistribution;
exports.getRootDir = getRootDir;
exports.getPackageDir = getPackageDir;
exports.getConfigFile = getConfigFile;
exports.resolveCLI = resolveCLI;
exports.runCLI = runCLI;
exports.runShell = runShell;
