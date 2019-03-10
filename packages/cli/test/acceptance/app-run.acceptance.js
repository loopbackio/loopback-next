// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const bootstrapCommandFactory = require('@lerna/bootstrap');
const build = require('@loopback/build');

describe('app-generator (SLOW)', function() {
  const generator = path.join(__dirname, '../../generators/app');
  const rootDir = path.join(__dirname, '../../../..');
  const sandbox = path.join(rootDir, 'sandbox/sandbox-app');
  const cwd = process.cwd();
  const appName = '@loopback/sandbox-app';
  const props = {
    name: appName,
    description: 'My sandbox app for LoopBack 4',
    outdir: sandbox,
  };

  before('scaffold a new application', async function createAppProject() {
    // Increase the timeout to 1 minute to accommodate slow CI build machines
    this.timeout(60 * 1000);
    await helpers
      .run(generator)
      .inDir(sandbox)
      // Mark it private to prevent accidental npm publication
      .withOptions({private: true})
      .withPrompts(props);
  });

  before('install dependencies', async function installDependencies() {
    // Run `lerna bootstrap --scope @loopback/sandbox-app`
    // WARNING: It takes a while to run `lerna bootstrap`
    this.timeout(15 * 60 * 1000);
    process.chdir(rootDir);
    await lernaBootstrap(appName);
  });

  it('passes `npm test` for the generated project', function() {
    // Increase the timeout to 5 minutes,
    // the tests can take more than 2 seconds to run.
    this.timeout(5 * 60 * 1000);

    return new Promise((resolve, reject) => {
      build
        .runShell('npm', ['test'], {
          // Disable stdout
          stdio: [process.stdin, 'ignore', process.stderr],
          cwd: sandbox,
        })
        .on('close', code => {
          assert.equal(code, 0);
          resolve();
        });
    });
  });

  after(function() {
    // Increase the timeout to accommodate slow CI build machines
    this.timeout(30 * 1000);

    process.chdir(rootDir);
    build.clean(['node', 'run-clean', sandbox]);
    process.chdir(cwd);
  });
});

async function lernaBootstrap(scope) {
  const cmd = bootstrapCommandFactory({
    _: [],
    ci: false,
    scope: scope,
    loglevel: 'silent',
    // Disable progress bars
    progress: false,
  });
  await cmd;
}
