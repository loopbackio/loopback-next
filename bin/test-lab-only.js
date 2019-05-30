#!/usr/bin/env node
// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is an internal script to update the mocha test command so that
 * it only tests the experimental packages in the `/labs` folder.
 */
'use strict';

const path = require('path');
const fs = require('fs');
const PACKAGE_JSON_PATH = path.join(path.join(__dirname, '../package.json'));

async function testLabPackagesOnly() {
  let pkg = readJsonFile(PACKAGE_JSON_PATH);
  const mochaCmd = "node packages/build/bin/run-mocha \"labs/*/dist/__tests__/**/*.js\"";
  pkg.scripts.mocha = mochaCmd;
  writeJsonFile(PACKAGE_JSON_PATH, pkg);
}

if (require.main === module) testLabPackagesOnly();

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  const mochaTestCmd = readJsonFile(filePath).scripts.mocha;
  console.log('The test script is updated as > %s', mochaTestCmd);
}
