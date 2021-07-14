#!/usr/bin/env node
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is an internal script to add a new package to `packages` or `extensions`
 * of the `loopback-next` monorepo.
 *
 * The script does the following steps:
 *
 * 1. Determine the parentDir and package name.
 *
 * The first argument can be one of the following:
 * - package-name
 * - @loopback/package-name
 * - extensions/package-name
 * - packages/package-name
 *
 * If the parentDir is not specified, it tries to guess by the current directory
 * and falls back to `extensions`.
 *
 * 2. Run `lb4 extension` to scaffold the project without `npm install`. If
 * `--interactive` or `-i` is NOT provided by the command, interactive prompts
 * are skipped.
 *
 * 3. Fix up the project
 *    - Remove unused files
 *    - Improve `package.json`
 *
 * 4. Run `lb4 copyright` to update `LICENSE` and copyright headers for `*.ts`
 * and `*.js`.
 *
 * 5. Run `lerna bootstrap --scope <full-package-name>` to link its local
 * dependencies.
 *
 * 6. Run `update-ts-project-refs` to update TypeScript project references
 *
 * 7. Remind to update `CODEOWNERS` and `docs/site/MONOREPO.md`
 */
'use strict';

const build = require('../packages/build');
const path = require('path');
const cwd = process.cwd();
const fs = require('fs-extra');
const {runMain, updateTsProjectRefs} = require('../packages/monorepo');

/**
 * Return a promise to be resolved by the child process exit event
 * @param {ChildProcess} child - Child process
 */
function waitForProcessExit(child) {
  return new Promise((resolve, reject) => {
    child.on('exit', (code, signal) => {
      if (code === 0) resolve(code);
      else {
        reject(
          new Error(
            `Process ${child.pid} exits with code ${code} signal ${signal}`,
          ),
        );
      }
    });
  });
}

/**
 * Main function for the script
 */
async function createPackage(name) {
  if (name == null) {
    console.error(
      'Usage: %s <[parentDir]/package-name> [--yes]',
      path.relative(cwd, process.argv[1]),
    );
    process.exit(1);
  }

  let parentDir = undefined;

  // Check if the name is in the form of `<parentDir>/<name>`
  for (const loc of ['packages', 'extensions']) {
    if (name.startsWith(`${loc}/`)) {
      name = name.substring(`${loc}/`.length);
      parentDir = loc;
      break;
    }
  }

  const repoRoot = path.resolve(__dirname, '..');
  if (parentDir == null) {
    // Location not specified, try to infer it from the current directory
    parentDir = path.relative(repoRoot, cwd);
    if (parentDir !== 'packages' && parentDir !== 'extensions') {
      parentDir = 'extensions';
    }
  }

  const projectDir = `${parentDir}/${name}`;
  const project = {
    repoRoot,
    name,
    parentDir,
    projectDir,
  };

  const interactive =
    process.argv.includes('--interactive') || process.argv.includes('-i');
  const options = {interactive};

  await scaffoldProject(project, options);
  await fixupProject(project);
  await updateCopyrightAndLicense(project, options);
  await bootstrapProject(project);
  await updateTsProjectRefs({dryRun: false});

  promptActions(project);
}

async function scaffoldProject({repoRoot, parentDir, name}, options = {}) {
  process.chdir(path.join(repoRoot, parentDir));
  console.log('Adding project %s/%s...', parentDir, name);
  // Run `lb4 extension`
  const args = [
    'extension',
    `@loopback/${name}`,
    '--outdir',
    name,
    '--no-vscode',
    '--no-eslint',
    '--no-prettier',
    '--no-mocha',
    '--loopbackBuild',
    '--skip-install',
  ];

  if (options.interactive !== true) {
    args.push('--yes');
  }

  const cliProcess = build.runCLI(
    path.join(repoRoot, 'packages/cli/bin/cli-main'),
    args,
  );
  await waitForProcessExit(cliProcess);
}

async function bootstrapProject({repoRoot, name}) {
  process.chdir(repoRoot);
  // Run `npx lerna bootstrap --scope @loopback/<name>`
  const shell = build.runShell(
    'npx',
    ['lerna', 'bootstrap', '--scope', `@loopback/${name}`],
    {
      cwd: repoRoot,
    },
  );
  await waitForProcessExit(shell);
}

async function fixupProject({repoRoot, projectDir}) {
  process.chdir(path.join(repoRoot, projectDir));
  // Update package.json
  let pkg = fs.readJsonSync('package.json');
  pkg = {
    ...pkg,
    version: '0.0.1',
    author: 'IBM Corp.',
    'copyright.owner': 'IBM Corp.',
    license: 'MIT',
    publishConfig: {
      access: 'public',
    },
    repository: {
      type: 'git',
      url: 'https://github.com/strongloop/loopback-next.git',
      directory: projectDir,
    },
  };

  // Remove unused dependencies
  delete pkg.dependencies['@loopback/boot'];
  delete pkg.devDependencies['source-map-support'];

  fs.writeJsonSync('package.json', pkg, {spaces: 2});

  // Remove unused files
  build.clean([
    'node',
    '../build/bin/run-clean.js',
    'DEVELOPING.md',
    '.vscode',
    '.eslintignore',
    '.eslintrc.js',
    '.prettierignore',
    '.prettierrc',
    '.gitignore',
    '.mocharc.json',
    '.yo-repository',
    '.yo-rc.json',
  ]);
}

async function updateCopyrightAndLicense({repoRoot, projectDir}, options = {}) {
  process.chdir(path.join(repoRoot, projectDir));
  // Run `lb4 copyright`
  const copyrightArgs = [
    'copyright',
    '--owner',
    'IBM Corp.',
    '--license',
    'MIT',
    '--no-gitOnly',
  ];

  if (options.interactive !== true) {
    copyrightArgs.push('--yes', '--force');
  }
  const copyrightProcess = build.runCLI(
    path.join(repoRoot, 'packages/cli/bin/cli-main'),
    copyrightArgs,
  );
  await waitForProcessExit(copyrightProcess);
}

/**
 * Remind follow-up steps
 */
function promptActions({projectDir}) {
  console.log();
  console.log(
    `Package ${projectDir} is created. Please update the following files:`,
  );
  console.log('  - docs/site/MONOREPO.md');
  console.log('  - CODEOWNERS');
}

runMain(module, createPackage, process.argv[2]);
