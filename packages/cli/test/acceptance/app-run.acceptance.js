// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const bootstrapCommandFactory = require('@lerna/bootstrap');
const build = require('@loopback/build');

const appGenerator = path.join(__dirname, '../../generators/app');
const rootDir = path.join(__dirname, '../../../..');
const sandboxDir = path.join(rootDir, 'sandbox');

describe('app-generator (SLOW)', function () {
  const appProps = {
    name: '@loopback/sandbox-app',
    description: 'My sandbox app for LoopBack 4',
    outdir: path.join(sandboxDir, 'sandbox-app'),
  };

  before('scaffold a new application', async function createAppProject() {
    // Increase the timeout to 1 minute to accommodate slow CI build machines
    // eslint-disable-next-line no-invalid-this
    this.timeout(60 * 1000);
    await helpers
      .run(appGenerator)
      .inDir(appProps.outdir)
      // Mark it private to prevent accidental npm publication
      .withOptions({private: true})
      .withPrompts(appProps);
  });

  before('install dependencies', async function installDependencies() {
    // Run `lerna bootstrap --scope @loopback/sandbox-app --include-filtered-dependencies`
    // WARNING: It takes a while to run `lerna bootstrap`
    // eslint-disable-next-line no-invalid-this
    this.timeout(15 * 60 * 1000);
    process.chdir(rootDir);
    await lernaBootstrap(null, appProps.name);
  });

  it('passes `npm test` for the generated project', function () {
    // Increase the timeout to 5 minutes,
    // the tests can take more than 2 seconds to run.
    // eslint-disable-next-line no-invalid-this
    this.timeout(5 * 60 * 1000);

    return new Promise((resolve, reject) => {
      build
        .runShell('npm', ['test'], {
          // Disable stdout
          stdio: [process.stdin, 'ignore', process.stderr],
          cwd: appProps.outdir,
        })
        .on('close', code => {
          assert.equal(code, 0);
          resolve();
        });
    });
  });

  after(function () {
    // Increase the timeout to accommodate slow CI build machines
    // eslint-disable-next-line no-invalid-this
    this.timeout(30 * 1000);

    process.chdir(rootDir);
    build.clean(['node', 'run-clean', appProps.outdir]);
    process.chdir(process.cwd());
  });
});

build.runShell('yarn', ['help'], {stdio: 'ignore'}).on('close', code => {
  if (code === 0) return describe('app-generator with Yarn (SLOW)', yarnTest);
  return describe.skip;
});

function yarnTest() {
  const appProps = {
    name: '@loopback/sandbox-yarn-app',
    description: 'My sandbox app with Yarn for LoopBack 4',
    outdir: path.join(sandboxDir, 'sandbox-yarn-app'),
  };

  before('scaffold a new application', async function createAppProject() {
    // Increase the timeout to 1 minute to accommodate slow CI build machines
    // eslint-disable-next-line no-invalid-this
    this.timeout(60 * 1000);
    await helpers
      .run(appGenerator)
      .inDir(appProps.outdir)
      // Mark it private to prevent accidental npm publication
      .withOptions({packageManager: 'yarn', private: true})
      .withPrompts(appProps);
  });

  before('install dependencies', async function installDependencies() {
    // Run `lerna bootstrap --scope @loopback/sandbox-app --include-filtered-dependencies`
    // WARNING: It takes a while to run `lerna bootstrap`
    // eslint-disable-next-line no-invalid-this
    this.timeout(15 * 60 * 1000);
    process.chdir(rootDir);
    await lernaBootstrap('yarn', appProps.name);
  });

  it('passes `yarn test` for the generated project', function () {
    // Increase the timeout to 5 minutes,
    // the tests can take more than 2 seconds to run.
    // eslint-disable-next-line no-invalid-this
    this.timeout(5 * 60 * 1000);

    return new Promise((resolve, reject) => {
      build
        .runShell('yarn', ['test'], {
          // Disable stdout
          stdio: [process.stdin, 'ignore', process.stderr],
          cwd: appProps.outdir,
        })
        .on('close', code => {
          assert.equal(code, 0);
          resolve();
        });
    });
  });

  after(function () {
    // Increase the timeout to accommodate slow CI build machines
    // eslint-disable-next-line no-invalid-this
    this.timeout(30 * 1000);

    process.chdir(rootDir);
    build.clean(['node', 'run-clean', appProps.outdir]);
    process.chdir(process.cwd());
  });
}

async function lernaBootstrap(packageManager, ...scopes) {
  const cmd = bootstrapCommandFactory({
    _: [],
    ci: false,
    scope: scopes,
    includeFilteredDependencies: true,
    // The option "scope" controls both
    // - which packages to bootstrap
    // - which monorepo-local dependencies to resolve via symlinks
    // The option "forceLocal" tells lerna to always symlink local packages.
    // See https://github.com/lerna/lerna/commit/71174e4709 and
    // https://github.com/lerna/lerna/pull/2104
    forceLocal: true,
    loglevel: 'warn',
    // Disable progress bars
    progress: false,
    npmClient: packageManager || 'npm',
  });
  await cmd;
}
