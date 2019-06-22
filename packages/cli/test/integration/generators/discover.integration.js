// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

// Imports
const path = require('path');
const assert = require('yeoman-assert');
const testlab = require('@loopback/testlab');

const {expect, TestSandbox} = testlab;

const generator = path.join(__dirname, '../../../generators/discover');
require('../lib/artifact-generator')(generator);
require('../lib/base-generator')(generator);
const testUtils = require('../../test-utils');
const basicModelFileChecks = require('../lib/file-check').basicModelFileChecks;

// Test Sandbox
const SANDBOX_PATH = path.resolve(__dirname, '../.sandbox');
const SANDBOX_FILES = require('../../fixtures/discover').SANDBOX_FILES;
const sandbox = new TestSandbox(SANDBOX_PATH);

// CLI Inputs
const baseOptions = {
  all: true,
  dataSource: 'mem',
};
const outDirOptions = {
  ...baseOptions,
  outDir: 'src',
};
const schemaViewsOptions = {
  ...baseOptions,
  schema: 'aSchema',
  views: false,
};
const missingDataSourceOptions = {
  dataSource: 'foo',
};

// Expected File Name
const defaultExpectedTestModel = path.join(
  SANDBOX_PATH,
  'src/models/test.model.ts',
);
const defaultExpectedSchemaModel = path.join(
  SANDBOX_PATH,
  'src/models/schema.model.ts',
);
const defaultExpectedViewModel = path.join(
  SANDBOX_PATH,
  'src/models/view.model.ts',
);

const defaultExpectedIndexFile = path.join(SANDBOX_PATH, 'src/models/index.ts');
const movedExpectedTestModel = path.join(SANDBOX_PATH, 'src/test.model.ts');
const movedExpectedIndexFile = path.join(SANDBOX_PATH, 'src/index.ts');

// Base Tests
/*describe('discover-generator extending BaseGenerator', baseTests);
describe('generator-loopback4:discover', tests);*/

describe('lb4 discover integration', () => {
  describe('model discovery', () => {
    beforeEach('creates dist/datasources', async () => {
      await sandbox.mkdir('dist/datasources');
    });
    beforeEach('reset sandbox', () => sandbox.reset());

    it('generates all models without prompts using --all --dataSource', async function() {
      // eslint-disable-next-line no-invalid-this
      this.timeout(10000);
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withOptions(baseOptions);

      basicModelFileChecks(defaultExpectedTestModel, defaultExpectedIndexFile);
      assert.file(defaultExpectedSchemaModel);
      assert.file(defaultExpectedViewModel);
    });
    it('uses a different --outDir if provided', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withOptions(outDirOptions);

      basicModelFileChecks(movedExpectedTestModel, movedExpectedIndexFile);
    });
    it('excludes models based on the --views and --schema options', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withOptions(schemaViewsOptions);

      assert.noFile(defaultExpectedViewModel);
      assert.noFile(defaultExpectedTestModel);
      assert.file(defaultExpectedSchemaModel);
    });
    it('will fail gracefully if you specify a --dataSource which does not exist', async () => {
      return expect(
        testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withOptions(missingDataSourceOptions),
      ).to.be.rejectedWith(/Cannot find datasource/);
    });
  });
});
