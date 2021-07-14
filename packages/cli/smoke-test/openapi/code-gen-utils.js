// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const lerna = require('lerna');
const build = require('@loopback/build');

const appGenerator = path.join(__dirname, '../../generators/app');
const openapiGenerator = path.join(__dirname, '../../generators/openapi');
const rootDir = path.join(__dirname, '../../../..');
const cwd = process.cwd();

/**
 * Scaffold an application project
 * @param {string} appName Name of the application
 */
async function createAppProject(appName) {
  // The root directory of the application project
  // loopback-next/sandbox/<appName>
  const sandbox = path.join(rootDir, 'sandbox', appName);
  const pkgName = `@loopback/${appName}`;
  const props = {
    name: pkgName,
    description: 'My sandbox app for LoopBack 4',
    outdir: sandbox,
  };

  await helpers
    .run(appGenerator)
    .inDir(sandbox)
    // Mark it private to prevent accidental npm publication
    .withOptions({private: true})
    .withPrompts(props);

  process.chdir(rootDir);
  await lernaBootstrap(pkgName);

  return sandbox;
}

async function generateOpenApiArtifacts(sandbox, spec) {
  await helpers.run(openapiGenerator).cd(sandbox).withPrompts({
    url: spec,
  });
}

function runNpmTest(sandbox) {
  return runNpmScript(sandbox, ['test']);
}

function runLintFix(sandbox) {
  return runNpmScript(sandbox, ['run', 'lint:fix']);
}

function runNpmScript(sandbox, args) {
  return new Promise((resolve, reject) => {
    build
      .runShell('npm', args, {
        // Disable stdout
        stdio: [process.stdin, process.stdout, process.stderr],
        cwd: sandbox,
      })
      .on('close', code => {
        assert.equal(code, 0);
        resolve();
      });
  });
}

function cleanSandbox(sandbox) {
  process.chdir(rootDir);
  build.clean(['node', 'run-clean', sandbox]);
  process.chdir(cwd);
}

function lernaBootstrap(scope) {
  const cmd = new lerna.BootstrapCommand('', {
    scope: scope,
    loglevel: 'silent',
  });
  return cmd.run();
}

module.exports = {
  createAppProject,
  generateOpenApiArtifacts,
  cleanSandbox,
  runNpmTest,
  runLintFix,
};
