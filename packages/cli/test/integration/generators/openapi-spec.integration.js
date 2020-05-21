// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const testlab = require('@loopback/testlab');

const TestSandbox = testlab.TestSandbox;

const generator = path.join(__dirname, '../../../generators/openapi-spec');
const SANDBOX_FILES = require('../../fixtures/openapi-spec').SANDBOX_FILES;
const testUtils = require('../../test-utils');
const {expectFileToMatchSnapshot} = require('../../snapshots');

// Test Sandbox
const sandbox = new TestSandbox(path.resolve(__dirname, '../.sandbox'));

describe('lb4 openapi-spec', () => {
  beforeEach('reset sandbox', async () => {
    await sandbox.reset();
  });

  it('generates json spec with --out', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () =>
        testUtils.givenLBProject(sandbox.path, {
          additionalFiles: SANDBOX_FILES,
        }),
      )
      .withOptions({out: 'spec.json'});
    expectFileToMatchSnapshot('spec.json');
  });

  it('generates json spec with outFile prompt', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () =>
        testUtils.givenLBProject(sandbox.path, {
          additionalFiles: SANDBOX_FILES,
        }),
      )
      .withPrompts({outFile: 'spec.json'});
    expectFileToMatchSnapshot('spec.json');
  });

  it('generates json spec to dist/openapi.json', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () =>
        testUtils.givenLBProject(sandbox.path, {
          additionalFiles: SANDBOX_FILES,
        }),
      )
      .withPrompts({});
    expectFileToMatchSnapshot('dist/openapi.json');
  });

  it('generates yaml spec with --out', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () =>
        testUtils.givenLBProject(sandbox.path, {
          additionalFiles: SANDBOX_FILES,
        }),
      )
      .withOptions({out: 'spec.yaml'});
    expectFileToMatchSnapshot('spec.yaml');
  });

  it('generates yml spec with --out', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () =>
        testUtils.givenLBProject(sandbox.path, {
          additionalFiles: SANDBOX_FILES,
        }),
      )
      .withOptions({out: 'spec.yml'});
    expectFileToMatchSnapshot('spec.yml');
  });
});
