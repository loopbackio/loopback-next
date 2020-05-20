// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const assert = require('yeoman-assert');
const fs = require('fs');
const path = require('path');
const {initializeSnapshots} = require('./snapshot-matcher');

const expectToMatchSnapshot = initializeSnapshots(
  path.resolve(__dirname, '../snapshots'),
);

function expectFileToMatchSnapshot(filePath) {
  assert.file(filePath);
  const content = fs.readFileSync(filePath, {encoding: 'utf-8'});
  expectToMatchSnapshot(content);
}

/**
 * Assert a list of files to match snapshots
 * @param {object} options Options
 *   - exists: assert the file exists or not
 *   - rootPath: rootPath for file names
 * @param  {...string} files
 */
function assertFilesToMatchSnapshot(options, ...files) {
  options = {exists: true, ...options};
  if (options.rootPath) {
    files = files.map(f => path.resolve(options.rootPath, f));
  }

  for (const f of files) {
    if (options.exists === false) {
      assert.noFile(f);
      break;
    }
    assert.file(f);
    expectFileToMatchSnapshot(f);
  }
}

module.exports = {
  expectToMatchSnapshot,
  expectFileToMatchSnapshot,
  assertFilesToMatchSnapshot,
};
