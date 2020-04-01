// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const _ = require('lodash');
const cp = require('child_process');
const util = require('util');
const debug = require('debug')('loopback:cli:copyright:git');

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
        // reject(err);
        resolve([]);
      } else {
        cache.set(key, stdout);
        debug('Stdout', stdout);
        resolve(stdout);
      }
    });
  });
}

/**
 * Inspect years for a given file based on git history
 * @param {string} file - JS/TS file
 */
async function getYears(file) {
  file = file || '.';
  let dates = await git(
    process.cwd(),
    '--no-pager log --pretty=%%ai --all -- %s',
    file,
  );
  debug('Dates for %s', file, dates);
  if (_.isEmpty(dates)) {
    // if the given path doesn't have any git history, assume it is new
    dates = [new Date().toJSON()];
  } else {
    dates = [_.head(dates), _.last(dates)];
  }
  const years = _.map(dates, getYear);
  return _.uniq(years).sort();
}

// assumes ISO-8601 (or similar) format
function getYear(str) {
  return str.slice(0, 4);
}

exports.git = git;
exports.getYears = getYears;
