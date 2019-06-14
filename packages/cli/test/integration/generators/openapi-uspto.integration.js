// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const generator = path.join(__dirname, '../../../generators/openapi');
const specPath = path.join(__dirname, '../../fixtures/openapi/3.0/uspto.yaml');

const testlab = require('@loopback/testlab');
const TestSandbox = testlab.TestSandbox;

// Test Sandbox
const SANDBOX_PATH = path.resolve(__dirname, '../.sandbox');
const sandbox = new TestSandbox(SANDBOX_PATH);
const testUtils = require('../../test-utils');

const props = {
  url: specPath,
};

describe('openapi-generator specific files', () => {
  const index = path.resolve(SANDBOX_PATH, 'src/controllers/index.ts');
  const searchController = path.resolve(
    SANDBOX_PATH,
    'src/controllers/search.controller.ts',
  );
  const metadataController = path.resolve(
    SANDBOX_PATH,
    'src/controllers/metadata.controller.ts',
  );
  after(async function resetSandbox() {
    await sandbox.reset();
  });

  it('generates all the proper files', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH))
      .withPrompts(props);
    assert.file(searchController);

    assert.fileContent(metadataController, 'export class MetadataController {');
    assert.fileContent(metadataController, `@operation('get', '/')`);
    assert.fileContent(
      metadataController,
      'async listDataSets(): Promise<DataSetList> {',
    );
    assert.fileContent(
      metadataController,
      `@operation('get', '/{dataset}/{version}/fields')`,
    );
    assert.fileContent(
      metadataController,
      `async listSearchableFields(@param({name: 'dataset', in: 'path'}) ` +
        `dataset: string, @param({name: 'version', in: 'path'}) ` +
        `version: string): Promise<string> {`,
    );

    assert.fileContent(index, `export * from './search.controller';`);
    assert.fileContent(index, `export * from './metadata.controller';`);
  });

  it('skips controllers not selected', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH))
      .withPrompts({
        url: specPath,
        controllerSelections: ['MetadataController'],
      });
    assert.file(metadataController);
    assert.noFile(searchController);
    assert.noFileContent(index, `export * from './search.controller';`);
    assert.fileContent(index, `export * from './metadata.controller';`);
  });
});
