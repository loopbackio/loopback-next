// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const {TestSandbox} = require('@loopback/testlab');
const {expectFileToMatchSnapshot} = require('../../snapshots');

const generator = path.join(__dirname, '../../../generators/openapi');
const specPath = path.join(__dirname, '../../fixtures/openapi/3.0/uspto.yaml');

// Test Sandbox
const sandbox = new TestSandbox(path.resolve(__dirname, '../.sandbox'));
const testUtils = require('../../test-utils');

const props = {
  url: specPath,
};

describe('openapi-generator specific files', () => {
  const modelIndex = path.resolve(sandbox.path, 'src/models/index.ts');
  const controIndex = path.resolve(sandbox.path, 'src/controllers/index.ts');
  const searchController = path.resolve(
    sandbox.path,
    'src/controllers/search.controller.ts',
  );
  const metadataController = path.resolve(
    sandbox.path,
    'src/controllers/metadata.controller.ts',
  );
  const performSearchRequestBodyModel = path.resolve(
    sandbox.path,
    'src/models/perform-search-request-body.model.ts',
  );
  const performSearchResponseBodyModel = path.resolve(
    sandbox.path,
    'src/models/perform-search-response-body.model.ts',
  );

  after('reset sandbox', async () => {
    await sandbox.reset();
  });

  it('generates all the proper files', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
      .withArguments('--promote-anonymous-schemas')
      .withPrompts(props);
    assert.file(searchController);
    expectFileToMatchSnapshot(searchController);

    assert.file(metadataController);
    expectFileToMatchSnapshot(metadataController);

    assert.file(performSearchRequestBodyModel);
    expectFileToMatchSnapshot(performSearchRequestBodyModel);

    assert.file(performSearchResponseBodyModel);
    expectFileToMatchSnapshot(performSearchResponseBodyModel);

    assert.file(modelIndex);
    expectFileToMatchSnapshot(modelIndex);

    assert.file(controIndex);
    expectFileToMatchSnapshot(controIndex);
  });
});
