// Copyright IBM Corp. 2019. All Rights Reserved.
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

module.exports = {
  expectToMatchSnapshot,
  expectFileToMatchSnapshot,
};
