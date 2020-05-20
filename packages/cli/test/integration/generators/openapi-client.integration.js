// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const {TestSandbox} = require('@loopback/testlab');
const {assertFilesToMatchSnapshot} = require('../../snapshots');

const generator = path.join(__dirname, '../../../generators/openapi');
const specPath = path.resolve(
  __dirname,
  '../../fixtures/openapi/3.0/petstore-expanded.yaml',
);

const SANDBOX_FILES = require('../../fixtures/openapi/3.0').SANDBOX_FILES;

// Test Sandbox
const sandbox = new TestSandbox(path.resolve(__dirname, '../.sandbox'));
const testUtils = require('../../test-utils');

const props = {
  url: specPath,
  dataSourceName: 'petStore',
};

describe('openapi-generator with --client', /** @this {Mocha.Suite} */ function () {
  // These tests take longer to execute, they used to time out on Travis CI
  this.timeout(10000);

  before('reset sandbox', () => sandbox.reset());
  afterEach('reset sandbox', () => sandbox.reset());

  it('generates all files for both server and client', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
      .withPrompts(props)
      .withOptions({client: true});

    assertControllers();
    assertDataSources();
    assertServices();
    assertModels();
  });

  it('allows baseModel option', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
      .withPrompts(props)
      .withOptions({client: true, baseModel: 'Model'});

    assertControllers();
    assertDataSources();
    assertServices();
    assertModels();
  });

  it('does not generates files for client with --no-client', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
      .withPrompts(props)
      .withOptions({client: false});

    const options = {exists: false};
    assertControllers();
    assertDataSources(options);
    assertServices(options);
    assertModels();
  });

  it('does not generates files for server with --no-server', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
      .withPrompts(props)
      .withOptions({server: false, client: true});

    assertControllers({exists: false});
    assertDataSources();
    assertServices();
    assertModels();
  });
});

it('generates files with --client for an existing datasource', /** @this {Mocha.Context} */ async function () {
  // These tests take longer to execute, they used to time out on Travis CI
  this.timeout(10000);
  await testUtils
    .executeGenerator(generator)
    .inDir(sandbox.path, () =>
      testUtils.givenLBProject(sandbox.path, {
        additionalFiles: SANDBOX_FILES,
      }),
    )
    .withPrompts({
      dataSource: {
        name: 'petStore',
        className: 'PetStoreDataSource',
        usePositionalParams: false,
        specPath: 'petstore-expanded.yaml',
      },
    })
    .withOptions({server: false, client: true});

  assertControllers({exists: false});
  assertServices();
  assertModels();
});

it('generates files with --client and --datasource for an existing datasource', async () => {
  await testUtils
    .executeGenerator(generator)
    .inDir(sandbox.path, () =>
      testUtils.givenLBProject(sandbox.path, {additionalFiles: SANDBOX_FILES}),
    )
    .withOptions({server: false, client: true, datasource: 'petStore'});

  assertControllers({exists: false});
  assertServices();
  assertModels();
});

function assertModels(options) {
  assertFiles(
    options,
    'src/models/index.ts',
    'src/models/pet.model.ts',
    'src/models/new-pet.model.ts',
    'src/models/error.model.ts',
  );
}

function assertControllers(options) {
  assertFiles(
    options,
    'src/controllers/index.ts',
    'src/controllers/open-api.controller.ts',
  );
}

function assertDataSources(options) {
  assertFiles(
    options,
    'src/datasources/index.ts',
    'src/datasources/pet-store.datasource.ts',
  );
}

function assertServices(options) {
  assertFiles(
    options,
    'src/services/index.ts',
    'src/services/open-api.service.ts',
  );
}

function assertFiles(options, ...files) {
  options = {rootPath: sandbox.path, ...options};
  assertFilesToMatchSnapshot(options, ...files);
}
