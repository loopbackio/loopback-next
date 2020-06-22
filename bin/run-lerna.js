#!/usr/bin/env node
// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is an internal script to run `lerna` command with enviornment variable
 * `LERNA_ROOT_PATH` set to the root directory of `loopback-next` monorepo
 */
'use strict';

const path = require('path');
const Project = require('@lerna/project');
const build = require('../packages/build');
const fs = require('fs');

async function run(argv, options) {
  let project;
  if (fs.existsSync('lerna.json')) {
    project = new Project(process.cwd());
  } else {
    project = new Project(path.join(__dirname, '..'));
  }
  const rootPath = project.rootPath;

  process.env.LERNA_ROOT_PATH = rootPath;
  const args = argv.slice(2);

  return build.runCLI('lerna/cli', args, options);
}

module.exports = run;
if (require.main === module) {
  run(process.argv).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
