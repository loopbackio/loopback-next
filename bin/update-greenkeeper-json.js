#!/usr/bin/env node
// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is an internal script to update `greenkeeper.json` with lerna packages.
 */
'use strict';

const path = require('path');
const fs = require('fs');

const Project = require('@lerna/project');

async function updateGreenKeeperJson() {
  const project = new Project(process.cwd());
  const packages = await project.getPackages();
  const rootPath = project.rootPath;
  const packageJsonPaths = packages.map(p =>
    path.relative(rootPath, p.manifestLocation),
  );
  const greenKeeperJson = {
    groups: {
      default: {
        packages: ['package.json'],
      },
    },
  };

  for (const p of packageJsonPaths) {
    if (p.startsWith('sandbox/')) continue;
    greenKeeperJson.groups.default.packages.push(p);
  }

  const greenKeeperJsonFile = path.join(rootPath, 'greenkeeper.json');
  let currentConfig = {};
  if (fs.existsSync(greenKeeperJsonFile)) {
    currentConfig = readJsonFile(greenKeeperJsonFile);
  }

  let updateRequired = false;
  if (
    !(
      currentConfig.groups &&
      currentConfig.groups.default &&
      Array.isArray(currentConfig.groups.default.packages)
    )
  ) {
    // Current config does not exist
    updateRequired = true;
  }

  if (!updateRequired) {
    // Check if packages are the same
    updateRequired = !arraysContainSameElements(
      currentConfig.groups.default.packages,
      greenKeeperJson.groups.default.packages,
    );
  }

  if (!updateRequired) {
    console.log('%s is up to date.', 'greenkeeper.json');
    return;
  }

  currentConfig = Object.assign(currentConfig, greenKeeperJson);

  if (process.argv[2] === '-f') {
    // Update `greenkeeper.json`
    writeJsonFile(greenKeeperJsonFile, currentConfig);
  } else {
    // Print out `greenkeeper.json`
    console.error('%s is out of date.', 'greenkeeper.json');
    console.log(JSON.stringify(currentConfig, null, 2));
  }
}

if (require.main === module) updateGreenKeeperJson();

/**
 * Test if two arrays contain the same set of elements
 * @param {Array} actual
 * @param {Array} expected
 */
function arraysContainSameElements(actual, expected) {
  return (
    // Same size
    actual.length == expected.length &&
    // `expected` contains all elements of `actual`
    actual.every(e => expected.includes(e)) &&
    // `actual` contains all elements of `expected`
    expected.every(e => actual.includes(e))
  );
}

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log('%s has been updated.', filePath);
}
