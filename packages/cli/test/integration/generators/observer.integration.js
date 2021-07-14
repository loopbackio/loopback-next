// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const testlab = require('@loopback/testlab');

const TestSandbox = testlab.TestSandbox;

const generator = path.join(__dirname, '../../../generators/observer');
const SANDBOX_FILES = require('../../fixtures/observer').SANDBOX_FILES;
const testUtils = require('../../test-utils');

// Test Sandbox
const sandbox = new TestSandbox(path.resolve(__dirname, '../.sandbox'));
const {expectFileToMatchSnapshot} = require('../../snapshots');

describe('lb4 observer', () => {
  beforeEach('reset sandbox', async () => {
    await sandbox.reset();
  });

  describe('valid generation of observers', () => {
    it('generates a basic observer from command line arguments', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withArguments('myObserver');
      verifyGeneratedScript();
    });

    it('generates a basic observer from CLI with group', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withArguments('myObserver --group myGroup');
      verifyGeneratedScript('myGroup');
    });

    it('generates a observer from a config file', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withArguments('--config myobserverconfig.json');
      verifyGeneratedScript();
    });
  });
});

// Sandbox constants
const SCRIPT_APP_PATH = 'src/observers';
const INDEX_FILE = path.join(sandbox.path, SCRIPT_APP_PATH, 'index.ts');

function verifyGeneratedScript(group = '') {
  const expectedFile = path.join(
    sandbox.path,
    SCRIPT_APP_PATH,
    'my-observer.observer.ts',
  );

  expectFileToMatchSnapshot(expectedFile);
  expectFileToMatchSnapshot(INDEX_FILE);
}
