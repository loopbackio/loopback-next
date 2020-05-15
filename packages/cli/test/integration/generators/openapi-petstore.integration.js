// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const {TestSandbox} = require('@loopback/testlab');
const {assertFilesToMatchSnapshot} = require('../../snapshots');

const generator = path.join(__dirname, '../../../generators/openapi');
const specPath = path.join(
  __dirname,
  '../../fixtures/openapi/3.0/petstore-expanded.yaml',
);

// Test Sandbox
const sandbox = new TestSandbox(path.resolve(__dirname, '../.sandbox'));
const testUtils = require('../../test-utils');

const props = {
  url: specPath,
};

describe('openapi-generator petstore', /** @this {Mocha.Suite} */ function () {
  // These tests take longer to execute, they used to time out on Travis CI
  this.timeout(10000);

  before('reset sandbox', () => sandbox.reset());
  afterEach('reset sandbox', () => sandbox.reset());

  it('generates all the proper files', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
      .withPrompts(props);

    const options = {};
    assertFiles(
      options,
      'src/controllers/index.ts',
      'src/controllers/open-api.controller.ts',
    );

    assertFiles(
      options,
      'src/models/index.ts',
      'src/models/pet.model.ts',
      'src/models/new-pet.model.ts',
      'src/models/error.model.ts',
    );
  });
});

function assertFiles(options, ...files) {
  options = {rootPath: sandbox.path, ...options};
  assertFilesToMatchSnapshot(options, ...files);
}
