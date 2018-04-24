// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const lerna = require('lerna');
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

  before(async () => {
    await helpers
      .run(generator)
      .inDir(sandbox)
      // Mark it private to prevent accidental npm publication
      .withOptions({private: true})
      .withPrompts(props);
  });

  // Run `lerna bootstrap --scope @loopback/sandbox-app`
  // WARNING: It takes a while to run `lerna bootstrap`
  this.timeout(0);
  before(async () => {
    process.chdir(rootDir);
    await lernaBootstrap(appName);
  });

  it('passes `npm test` for the generated project', () => {
    process.chdir(sandbox);
    return new Promise((resolve, reject) => {
      build
        .runShell('npm', ['test'], {
          // Disable stdout
          stdio: [process.stdin, 'ignore', process.stderr],
        })
        .on('close', code => {
          assert.equal(code, 0);
          resolve();
        });
    });
  });

  after(() => {
    process.chdir(rootDir);
    build.clean(['node', 'run-clean', sandbox]);
    process.chdir(cwd);
  });
});

function lernaBootstrap(scope) {
  const cmd = new lerna.BootstrapCommand('', {
    scope: scope,
    loglevel: 'silent',
  });
  return cmd.run();
}
