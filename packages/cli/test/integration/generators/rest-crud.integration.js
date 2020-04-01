// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const testlab = require('@loopback/testlab');

const expect = testlab.expect;
const TestSandbox = testlab.TestSandbox;

const generator = path.join(__dirname, '../../../generators/rest-crud');
const SANDBOX_FILES = require('../../fixtures/rest-crud').SANDBOX_FILES;
const testUtils = require('../../test-utils');

// Test Sandbox
const sandbox = new TestSandbox(path.resolve(__dirname, '../.sandbox'));

describe('lb4 rest-crud', function () {
  // eslint-disable-next-line no-invalid-this
  this.timeout(30000);

  beforeEach('reset sandbox', async () => {
    await sandbox.reset();
  });

  // special cases regardless of the rest-crud type
  describe('generate rest configs', () => {
    it('generates multiple model endpoint rest-configs from multiple models', async () => {
      const multiItemPrompt = {
        datasource: 'dbmem',
        modelNameList: ['MultiWord', 'DefaultModel'],
      };

      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withPrompts(multiItemPrompt);

      const expectedMultiWordFile = path.join(
        sandbox.path,
        MODEL_ENDPOINT_PATH,
        'multi-word.rest-config.ts',
      );
      const expectedDefaultModelFile = path.join(
        sandbox.path,
        MODEL_ENDPOINT_PATH,
        'default-model.rest-config.ts',
      );

      assert.file(expectedMultiWordFile);
      assert.file(expectedDefaultModelFile);

      assert.fileContent(
        expectedMultiWordFile,
        /import \{MultiWord\} from '\.\.\/models'/,
      );
      assert.fileContent(expectedMultiWordFile, /dataSource: 'dbmem'/);
      assert.fileContent(expectedMultiWordFile, /basePath: '\/multi-words'/);

      assert.fileContent(expectedDefaultModelFile, /dataSource: 'dbmem'/);
      assert.fileContent(
        expectedDefaultModelFile,
        /basePath: '\/default-models'/,
      );

      assert.noFile(INDEX_FILE);

      assertApplicationTsFileUpdated();
    });

    it('generates a multi-word rest-crud model endpoint', async () => {
      const multiItemPrompt = {
        dataSourceName: 'dbmem',
        modelNameList: ['MultiWord'],
      };

      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withPrompts(multiItemPrompt);

      const expectedFile = path.join(
        sandbox.path,
        MODEL_ENDPOINT_PATH,
        'multi-word.rest-config.ts',
      );

      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /import \{MultiWord\} from '\.\.\/models'/,
      );
      assert.fileContent(expectedFile, /dataSource: 'dbmem'/);
      assert.fileContent(expectedFile, /basePath: '\/multi-words'/);
      assertApplicationTsFileUpdated();
    });

    it('generates a single rest-crud model endpoint with base path', async () => {
      const singleModelPrompt = {
        basePath: '/multiWords',
        dataSourceName: 'dbmem',
        modelNameList: ['MultiWord'],
      };

      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withPrompts(singleModelPrompt);

      const expectedFile = path.join(
        sandbox.path,
        MODEL_ENDPOINT_PATH,
        'multi-word.rest-config.ts',
      );

      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /import \{MultiWord\} from '\.\.\/models'/,
      );
      assert.fileContent(expectedFile, /dataSource: 'dbmem'/);
      assert.fileContent(expectedFile, /basePath: '\/multiWords'/);
      assertApplicationTsFileUpdated();
    });

    it('generates a single rest-crud model endpoint with options', async () => {
      const options = {
        basePath: '/multiWords',
        datasource: 'dbmem',
        model: 'MultiWord',
      };
      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withOptions(options);

      const expectedFile = path.join(
        sandbox.path,
        MODEL_ENDPOINT_PATH,
        'multi-word.rest-config.ts',
      );

      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /import \{MultiWord\} from '\.\.\/models'/,
      );
      assert.fileContent(expectedFile, /dataSource: 'dbmem'/);
      assert.fileContent(expectedFile, /basePath: '\/multiWords'/);
      assertApplicationTsFileUpdated();
    });

    it('generates a rest-crud model endpoint from a config file', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withArguments('--config myconfig.json');
      const expectedFile = path.join(
        sandbox.path,
        MODEL_ENDPOINT_PATH,
        'decorator-defined.rest-config.ts',
      );
      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /import \{DecoratorDefined\} from '\.\.\/models'/,
      );
      assert.fileContent(expectedFile, /dataSource: 'dbmem'/);
      assert.fileContent(expectedFile, /basePath: '\/decorator-defineds'/);
      assertApplicationTsFileUpdated();
    });
  });

  describe('all invalid parameters and usage', () => {
    it('does not run with an invalid model name', async () => {
      const basicPrompt = {
        dataSourceName: 'db',
      };
      return expect(
        testUtils
          .executeGenerator(generator)
          .inDir(sandbox.path, () =>
            testUtils.givenLBProject(sandbox.path, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withPrompts(basicPrompt)
          .withArguments(' --model InvalidModel'),
      ).to.be.rejectedWith(/No models found/);
    });

    it("does not run when user doesn't select a model", async () => {
      const basicPrompt = {
        dataSourceName: 'db',
      };
      return expect(
        testUtils
          .executeGenerator(generator)
          .inDir(sandbox.path, () =>
            testUtils.givenLBProject(sandbox.path, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withPrompts(basicPrompt),
      ).to.be.rejectedWith(/You did not select a valid model/);
    });

    it('does not run with empty datasource list', async () => {
      return expect(
        testUtils
          .executeGenerator(generator)
          .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path)),
      ).to.be.rejectedWith(/No datasources found/);
    });
  });
});

// Sandbox constants
const MODEL_ENDPOINT_PATH = 'src/model-endpoints';
const INDEX_FILE = path.join(sandbox.path, MODEL_ENDPOINT_PATH, 'index.ts');

function assertApplicationTsFileUpdated() {
  const expectedAppFile = path.join(sandbox.path, 'src', 'application.ts');
  assert.fileContent(
    expectedAppFile,
    /import {CrudRestComponent} from '@loopback\/rest-crud';/,
  );
  assert.fileContent(expectedAppFile, /this\.component\(CrudRestComponent\);/);
}
