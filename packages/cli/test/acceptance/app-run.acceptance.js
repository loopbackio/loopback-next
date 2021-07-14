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
const utils = require('../../lib/utils');
const appGenerator = path.join(__dirname, '../../generators/app');
const rootDir = path.join(__dirname, '../../../..');
const sandboxDir = path.join(rootDir, 'sandbox');
const {skipIf} = require('@loopback/testlab');

/**
 * This test is fairly heavy and slow as it does the following steps:
 *
 * 1. Run `lb4 app` to scaffold an application
 * 2. Run `lerna bootstrap` to install/link dependencies
 * 3. Run `npm t` for the newly generated application
 *
 * We use `CI` environment variable to control if the test should be run. In
 * a CI system, the flag is always set and the test will always be run. On
 * a local machine, you can force this test to run by setting `CI` environment
 * variable.
 */
skipIf(process.env.CI == null, describe, 'app-generator (SLOW)', () => {
  const appProps = {
    name: '@loopback/sandbox-app',
    description: 'My sandbox app for LoopBack 4',
    outdir: path.join(sandboxDir, 'sandbox-app'),
  };

  before(
    'scaffold a new application',
    /** @this {Mocha.Context} */ function () {
      // Increase the timeout to 1 minute to accommodate slow CI build machines
      this.timeout(60 * 1000);

      return (
        helpers
          .run(appGenerator)
          .inDir(appProps.outdir)
          // Mark it private to prevent accidental npm publication
          .withOptions({private: true})
          .withPrompts(appProps)
      );
    },
  );

  before(
    'install dependencies',
    /** @this {Mocha.Context} */ function () {
      // Run `lerna bootstrap --scope @loopback/sandbox-app --include-filtered-dependencies`
      // WARNING: It takes a while to run `lerna bootstrap`
      this.timeout(15 * 60 * 1000);
      process.chdir(rootDir);
      return lernaBootstrap(null, appProps.name);
    },
  );

  it('passes `npm test` for the generated project', /** @this {Mocha.Context} */ function () {
    // Increase the timeout to 5 minutes,
    // the tests can take more than 2 seconds to run.
    this.timeout(5 * 60 * 1000);

    // FixMe: NPM v7 does not run lifecycle scripts for some reason. To solve this problem, run `pretest`,`test` and `posttest` separately
    // and should be run synchronous
    return new Promise(resolve => {
      build
        .runShell('npm', ['run', 'pretest'], {
          // Disable stdout
          stdio: [process.stdin, 'ignore', process.stderr],
          cwd: appProps.outdir,
        })
        .on('close', code => {
          assert.equal(code, 0);
          resolve();
        });
    })
      .then(() => {
        return new Promise(resolve => {
          build
            .runShell('npm', ['test', '--ignore-scripts'], {
              // Disable stdout
              stdio: [process.stdin, 'ignore', process.stderr],
              cwd: appProps.outdir,
            })
            .on('close', code => {
              assert.equal(code, 0);
              resolve();
            });
        });
      })
      .then(() => {
        return new Promise(resolve => {
          build
            .runShell('npm', ['run', 'posttest'], {
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
  });

  after(
    /** @this {Mocha.Context} */ function () {
      // Increase the timeout to accommodate slow CI build machines
      this.timeout(30 * 1000);

      process.chdir(rootDir);
      build.clean(['node', 'run-clean', appProps.outdir]);
      process.chdir(process.cwd());
    },
  );
});

/**
 * We use `CI` environment variable to control if the test should be run. In
 * a CI system, the flag is always set and the test will always be run. On
 * a local machine, you can force this test to run by setting `CI` environment
 * variable.
 */
skipIf(
  process.env.CI == null || !utils.isYarnAvailable(),
  describe,
  'app-generator with Yarn (SLOW)',
  () => {
    const appProps = {
      name: '@loopback/sandbox-yarn-app',
      description: 'My sandbox app with Yarn for LoopBack 4',
      outdir: path.join(sandboxDir, 'sandbox-yarn-app'),
    };

    before(
      'scaffold a new application',
      /** @this {Mocha.Context} */ function () {
        // Increase the timeout to 1 minute to accommodate slow CI build machines
        this.timeout(60 * 1000);

        return (
          helpers
            .run(appGenerator)
            .inDir(appProps.outdir)
            // Mark it private to prevent accidental npm publication
            .withOptions({
              applicationName: 'YarnApp',
              packageManager: 'yarn',
              private: true,
            })
            .withPrompts(appProps)
        );
      },
    );

    before(
      'install dependencies',
      /** @this {Mocha.Context} */ function () {
        // Run `lerna bootstrap --scope @loopback/sandbox-app --include-filtered-dependencies`
        // WARNING: It takes a while to run `lerna bootstrap`
        this.timeout(15 * 60 * 1000);
        process.chdir(rootDir);
        return lernaBootstrap('yarn', appProps.name);
      },
    );

    it('passes `yarn test` for the generated project', /** @this {Mocha.Context} */ function () {
      // Increase the timeout to 5 minutes,
      // the tests can take more than 2 seconds to run.
      this.timeout(5 * 60 * 1000);

      return new Promise(resolve => {
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

    after(
      /** @this {Mocha.Context} */ function () {
        // Increase the timeout to accommodate slow CI build machines
        this.timeout(30 * 1000);

        process.chdir(rootDir);
        build.clean(['node', 'run-clean', appProps.outdir]);
        process.chdir(process.cwd());
      },
    );
  },
);

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
