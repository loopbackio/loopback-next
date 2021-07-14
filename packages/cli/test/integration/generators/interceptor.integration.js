// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const {TestSandbox} = require('@loopback/testlab');

const generator = path.join(__dirname, '../../../generators/interceptor');
const SANDBOX_FILES = require('../../fixtures/interceptor').SANDBOX_FILES;
const testUtils = require('../../test-utils');

const {expectFileToMatchSnapshot} = require('../../snapshots');

// Test Sandbox
const sandbox = new TestSandbox(path.resolve(__dirname, '../.sandbox'));

// Sandbox constants
const SCRIPT_APP_PATH = 'src/interceptors';
const INDEX_FILE = path.join(sandbox.path, SCRIPT_APP_PATH, 'index.ts');
const GENERATED_FILE = path.join(
  sandbox.path,
  SCRIPT_APP_PATH,
  'my-interceptor.interceptor.ts',
);

describe('lb4 interceptor', () => {
  beforeEach('reset sandbox', async () => {
    await sandbox.reset();
  });

  describe('valid generation of interceptors', () => {
    it('generates a basic interceptor from command line arguments', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withArguments('myInterceptor');
      expectFileToMatchSnapshot(GENERATED_FILE);
      expectFileToMatchSnapshot(INDEX_FILE);
    });

    it('generates a basic interceptor from CLI with group', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withArguments('myInterceptor --group myGroup');
      expectFileToMatchSnapshot(GENERATED_FILE);
      expectFileToMatchSnapshot(INDEX_FILE);
    });

    it('generates a interceptor from a config file', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withArguments('--config myinterceptorconfig.json');
      expectFileToMatchSnapshot(GENERATED_FILE);
      expectFileToMatchSnapshot(INDEX_FILE);
    });

    it('generates a non-global interceptor from CLI', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withArguments('myInterceptor --no-global');
      expectFileToMatchSnapshot(GENERATED_FILE);
      expectFileToMatchSnapshot(INDEX_FILE);
    });

    it('generates a non-global interceptor with prompts', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withPrompts({name: 'myInterceptor', isGlobal: false});
      expectFileToMatchSnapshot(GENERATED_FILE);
      expectFileToMatchSnapshot(INDEX_FILE);
    });
  });
});
