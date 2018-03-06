// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

const lerna = require('lerna');
function lernaBootstrap() {
  const cmd = new lerna.BootstrapCommand('', {
    loglevel: 'silent',
  });
  return cmd.run();
}

const runShell = require('@loopback/build').runShell;

describe('app-generator', function() {
  const generator = path.join(__dirname, '../generators/app');
  const rootDir = path.join(__dirname, '../../..');
  const sandbox = path.join(__dirname, '../../_sandbox');
  const cwd = process.cwd();
  const props = {
    name: 'myApp',
    description: 'My app for LoopBack 4',
    outdir: sandbox,
  };

  // WARNING: It takes a while to run `lerna bootstrap`
  this.timeout(0);
  before(() => {
    return helpers
      .run(generator)
      .inDir(sandbox)
      .withPrompts(props);
  });

  it('passes `npm test` for the generated project', async () => {
    process.chdir(rootDir);
    await lernaBootstrap();
    process.chdir(sandbox);
    return new Promise((resolve, reject) => {
      runShell('npm', ['test', '--', '--allow-console-logs']).on(
        'close',
        code => {
          process.chdir(cwd);
          assert.equal(code, 0);
          resolve();
        }
      );
    });
  });
});
