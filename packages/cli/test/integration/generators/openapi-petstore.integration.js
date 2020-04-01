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

describe('openapi-generator specific files', function () {
  // These tests take longer to execute, they used to time out on Travis CI
  // eslint-disable-next-line no-invalid-this
  this.timeout(10000);

  const modelIndex = path.resolve(sandbox.path, 'src/models/index.ts');
  const controIndex = path.resolve(sandbox.path, 'src/controllers/index.ts');
  const controller = path.resolve(
    sandbox.path,
    'src/controllers/open-api.controller.ts',
  );
  const petModel = path.resolve(sandbox.path, 'src/models/pet.model.ts');
  const newPetModel = path.resolve(sandbox.path, 'src/models/new-pet.model.ts');
  const errorModel = path.resolve(sandbox.path, 'src/models/error.model.ts');

  after('reset sandbox', async () => {
    await sandbox.reset();
  });

  it('generates all the proper files', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
      .withPrompts(props);

    assert.file(modelIndex);
    expectFileToMatchSnapshot(modelIndex);

    assert.file(controIndex);
    expectFileToMatchSnapshot(controIndex);

    assert.file(controller);
    expectFileToMatchSnapshot(controller);

    assert.file(petModel);
    expectFileToMatchSnapshot(petModel);

    assert.file(newPetModel);
    expectFileToMatchSnapshot(newPetModel);

    assert.file(errorModel);
    expectFileToMatchSnapshot(errorModel);
  });
});
