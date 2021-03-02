#!/usr/bin/env node
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/monorepo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is a script to run `lerna` command with environment variable
 * `LERNA_ROOT_PATH` set to the root directory of monorepo
 */
'use strict';

const {Project} = require('@lerna/project');
const lernaCli = require('lerna');
const {runMain} = require('./script-util');

/**
 * Run the `lerna` cli
 * @param {string[]} argv - Arguments
 * @param {string} cwd - Current directory
 */
async function runLernaCommand(
  argv = process.argv.slice(2),
  cwd = process.cwd(),
) {
  const project = new Project(cwd);
  const rootPath = project.rootPath;

  process.env.LERNA_ROOT_PATH = rootPath;

  lernaCli(argv);
}

module.exports = runLernaCommand;

runMain(module, runLernaCommand);
