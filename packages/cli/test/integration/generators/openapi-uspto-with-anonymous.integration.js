// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const {TestSandbox} = require('@loopback/testlab');
const {assertFilesToMatchSnapshot} = require('../../snapshots');

const generator = path.join(__dirname, '../../../generators/openapi');
const specPath = path.join(__dirname, '../../fixtures/openapi/3.0/uspto.yaml');

// Test Sandbox
const sandbox = new TestSandbox(path.resolve(__dirname, '../.sandbox'));
const testUtils = require('../../test-utils');

const props = {
  url: specPath,
};

describe('openapi-generator uspto with anonymous', () => {
  before('reset sandbox', () => sandbox.reset());
  afterEach('reset sandbox', () => sandbox.reset());

  it('generates all the proper files', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
      .withArguments('--promote-anonymous-schemas')
      .withPrompts(props);

    assertFiles(
      {},
      'src/controllers/index.ts',
      'src/controllers/search.controller.ts',
      'src/controllers/metadata.controller.ts',
    );

    assertFiles(
      {},
      'src/models/index.ts',

      'src/models/perform-search-request-body.model.ts',
      'src/models/perform-search-response-body.model.ts',
    );
  });
});

function assertFiles(options, ...files) {
  options = {rootPath: sandbox.path, ...options};
  assertFilesToMatchSnapshot(options, ...files);
}
