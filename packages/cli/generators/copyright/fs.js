// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const fse = require('fs-extra');
const _ = require('lodash');
const {promisify} = require('util');
const glob = promisify(require('glob'));

const defaultFS = {
  write: fse.writeFile,
  read: fse.readFile,
  writeJSON: fse.writeJson,
  readJSON: fse.readJson,
  exists: fse.exists,
};

/**
 * List all JS/TS files
 * @param {string[]} paths - Paths to search
 */
async function jsOrTsFiles(cwd, paths = []) {
  paths = [].concat(paths);
  let globs;
  if (paths.length === 0) {
    globs = [glob('**/*.{js,ts}', {nodir: true, follow: false, cwd})];
  } else {
    globs = paths.map(p => {
      if (/\/$/.test(p)) {
        p += '**/*.{js,ts}';
      } else if (!/[^*]\.(js|ts)$/.test(p)) {
        p += '/**/*.{js,ts}';
      }
      return glob(p, {nodir: true, follow: false, cwd});
    });
  }
  paths = await Promise.all(globs);
  paths = _.flatten(paths);
  return _.filter(paths, /\.(js|ts)$/);
}

exports.FSE = defaultFS;
exports.jsOrTsFiles = jsOrTsFiles;
