// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

// Imports
const path = require('path');
const assert = require('yeoman-assert');
const testlab = require('@loopback/testlab');

const expect = testlab.expect;
const TestSandbox = testlab.TestSandbox;

const generator = path.join(__dirname, '../../../generators/datasource');
const tests = require('../lib/artifact-generator')(generator);
const baseTests = require('../lib/base-generator')(generator);
const testUtils = require('../../test-utils');
const {expectFileToMatchSnapshot} = require('../../snapshots');

// Test Sandbox
const sandbox = new TestSandbox(path.resolve(__dirname, '../.sandbox'));

// CLI Inputs
const basicCLIInput = {
  name: 'ds',
};

const cloudantCLIInput = {
  name: 'ds',
  connector: 'cloudant',
  url: 'http://user:pass@host.com',
  username: 'user',
  password: 'pass',
};

const numberCLIInput = {
  name: 'ds',
  connector: 'db2',
  port: '100',
};

const complexCLIInput = {
  name: 'ds',
  connector: 'rest',
  options: '{"test": "value"}',
  operations: '["get", "post"]',
};

const expectedComplexJSONOutput = {
  name: 'ds',
  connector: 'rest',
  options: {test: 'value'},
  operations: ['get', 'post'],
};

// Expected File Name
const expectedTSFile = path.join(
  sandbox.path,
  'src/datasources/ds.datasource.ts',
);

const expectedJSONFile = path.join(
  sandbox.path,
  'src/datasources/ds.datasource.config.json',
);

const expectedIndexFile = path.join(sandbox.path, 'src/datasources/index.ts');

// Base Tests
describe('datasource-generator extending BaseGenerator', baseTests);
describe('generator-loopback4:datasource', tests);

describe('lb4 datasource integration', () => {
  beforeEach('reset sandbox', () => sandbox.reset());

  it('does not run without package.json', () => {
    return expect(
      testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {excludePackageJSON: true}),
        )
        .withPrompts(basicCLIInput),
    ).to.be.rejectedWith(/No package.json found in/);
  });

  it('does not run without the "@loopback/core" dependency', () => {
    return expect(
      testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {excludeLoopbackCore: true}),
        )
        .withPrompts(basicCLIInput),
    ).to.be.rejectedWith(/No `@loopback\/core` package found/);
  });

  describe('basic datasource', () => {
    it('scaffolds correct file with input', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
        .withPrompts(basicCLIInput);

      checkBasicDataSourceFiles();

      assert.jsonFileContent(expectedJSONFile, basicCLIInput);
    });

    it('scaffolds correct file with args', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
        .withArguments('ds');

      checkBasicDataSourceFiles();
      assert.jsonFileContent(expectedJSONFile, basicCLIInput);
    });
  });

  it('scaffolds correct file with cloudant input', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
      .withPrompts(cloudantCLIInput);

    checkBasicDataSourceFiles();
    assert.jsonFileContent(expectedJSONFile, cloudantCLIInput);
  });

  it('correctly coerces setting input of type number', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
      .withPrompts(numberCLIInput);

    checkBasicDataSourceFiles();
    assert.jsonFileContent(
      expectedJSONFile,
      Object.assign({}, numberCLIInput, {port: 100}),
    );
  });

  it('correctly coerces setting input of type object and array', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
      .withPrompts(complexCLIInput);

    checkBasicDataSourceFiles();
    assert.jsonFileContent(expectedJSONFile, expectedComplexJSONOutput);
  });
});

function checkBasicDataSourceFiles() {
  assert.file(expectedTSFile);
  assert.file(expectedJSONFile);
  assert.file(expectedIndexFile);
  assert.noFile(path.join(sandbox.path, 'node_modules/memory'));

  expectFileToMatchSnapshot(expectedTSFile);

  assert.fileContent(expectedIndexFile, /export \* from '.\/ds.datasource';/);
}
