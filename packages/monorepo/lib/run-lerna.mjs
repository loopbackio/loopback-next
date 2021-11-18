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

import { Project } from '@lerna/project';
import lernaCli from 'lerna';
import { runMain } from './script-util.cjs';

/**
 * Run the `lerna` cli
 * @param {string[]} argv - Arguments./script-util
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

export { runLernaCommand as runLerna };

runMain(import.meta.url, runLernaCommand);
