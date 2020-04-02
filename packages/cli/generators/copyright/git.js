// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const _ = require('lodash');
const cp = require('child_process');
const util = require('util');
const debug = require('debug')('loopback:cli:copyright:git');

module.exports = git;

const cache = new Map();

/**
 * Run a git command
 * @param {string} cwd - Current directory to run the command
 * @param  {...any} args - Args for the git command
 */
async function git(cwd, ...args) {
  const cmd = 'git ' + util.format(...args);
  const key = `${cwd}:${cmd}`;
  debug('Running %s in directory', cmd, cwd);
  if (cache.has(key)) {
    return cache.get(key);
  }
  return new Promise((resolve, reject) => {
    cp.exec(cmd, {maxBuffer: 1024 * 1024, cwd}, (err, stdout) => {
      stdout = _(stdout || '')
        .split(/[\r\n]+/g)
        .map(_.trim)
        .filter()
        .value();
      if (err) {
        reject(err);
      } else {
        cache.set(key, stdout);
        debug('Stdout', stdout);
        resolve(stdout);
      }
    });
  });
}
