// Copyright IBM Corp. 2017,2018. All Rights Reserved.
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
  const dir = getPackageDir();
  let configFile = path.join(dir, name);
  if (!fs.existsSync(configFile)) {
    debug('%s does not exist', configFile);
    if (defaultName) {
      configFile = path.join(dir, defaultName);
      if (!fs.existsSync(configFile)) {
        debug('%s does not exist', configFile);
        configFile = path.join(getRootDir(), 'config/' + name);
      } else {
        debug('%s found', configFile);
      }
    } else {
      // Fall back to config/
      configFile = path.join(getRootDir(), 'config/' + name);
      debug('%s found', configFile);
    }
  } else {
    debug('%s found', configFile);
  }
  return configFile;
}

/**
 * Resolve the path of the cli command
 * @param {string} cli
 */
function resolveCLI(cli) {
  const modulePath = './node_modules/' + cli;
  try {
    return require.resolve(path.join(getPackageDir(), modulePath));
  } catch (e) {
    return require.resolve(cli);
  }
}

/**
 * Run a command with the given arguments
 * @param {string} cli Path of the cli command
 * @param {string[]} args The arguments
 * @param {object} options Options to control dryRun and spawn
 * - nodeArgs An array of args for `node`
 * - dryRun Controls if the cli will be executed or not. If set
 * to true, the command itself will be returned without running it
 */
function runCLI(cli, args, options) {
  cli = resolveCLI(cli);
  args = [cli].concat(args);
  debug('%s', args.join(' '));
  // Keep it backward compatible as dryRun
  if (typeof options === 'boolean') options = {dryRun: options};
  options = options || {};
  if (options.dryRun) {
    return util.format('%s %s', process.execPath, args.join(' '));
  }
  if (options.nodeArgs) {
    debug('node args: %s', options.nodeArgs.join(' '));
    // For example, [--no-warnings]
    args = options.nodeArgs.concat(args);
  }
  debug('Spawn %s %s', process.execPath, args.join(' '));
  const child = spawn(
    process.execPath, // Typically '/usr/local/bin/node'
    args,
    Object.assign(
      {
        stdio: 'inherit',
        env: Object.create(process.env),
      },
      options,
    ),
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
 * @param {object} options Options to control dryRun and spawn
 * - dryRun Controls if the cli will be executed or not. If set
 * to true, the command itself will be returned without running it
 */
function runShell(command, args, options) {
  args = args.map(a => JSON.stringify(a));
  debug('%s %s', command, args.join(' '));
  // Keep it backward compatible as dryRun
  if (typeof options === 'boolean') options = {dryRun: options};
  options = options || {};
  if (options.dryRun) {
    return util.format('%s %s', command, args.join(' '));
  }
  const child = spawn(
    command,
    args,
    Object.assign(
      {
        stdio: 'inherit',
        env: Object.create(process.env),
        // On Windows, npm creates `.cmd` files instead of symlinks in
        // `node_modules/.bin` folder. These files cannot be executed directly,
        // only via a shell.
        shell: true,
      },
      options,
    ),
  );
  child.on('close', (code, signal) => {
    debug('%s exits: %d', command, code);
    if (code > 0 || signal) {
      console.warn(
        'Command aborts (code %d signal %s): %s %s.',
        code,
        signal,
        command,
        args.join(' '),
      );
    }
    if (signal === 'SIGKILL' && code === 0) {
      // Travis might kill processes under resource pressure
      code = 128;
    }
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
  return opts.some(opt =>
    // It can be --my-opt or --my-opt=my-value
    optionNames.some(name => name === opt || opt.startsWith(`${name}=`)),
  );
}

function mochaConfiguredForProject() {
  const configFiles = [
    '.mocharc.js',
    '.mocharc.json',
    '.mocharc.yaml',
    '.mocharc.yml',
    'test/mocha.opts',
  ];
  return configFiles.some(f => {
    const configFile = path.join(getPackageDir(), f);
    return fs.existsSync(configFile);
  });
}

exports.getRootDir = getRootDir;
exports.getPackageDir = getPackageDir;
exports.getConfigFile = getConfigFile;
exports.resolveCLI = resolveCLI;
exports.runCLI = runCLI;
exports.runShell = runShell;
exports.isOptionSet = isOptionSet;
exports.mochaConfiguredForProject = mochaConfiguredForProject;
