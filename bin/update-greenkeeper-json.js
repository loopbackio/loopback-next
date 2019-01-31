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
    greenKeeperJson.groups.default.packages.push(p);
  }

  if (process.argv[2] === '-f') {
    const greenKeeperJsonFile = path.join(rootPath, 'greenkeeper.json');
    writeJsonFile(greenKeeperJsonFile, greenKeeperJson);
  } else {
    console.log(JSON.stringify(greenKeeperJson, null, 2));
  }
}

if (require.main === module) updateGreenKeeperJson();

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log('%s has been updated.', filePath);
}
