// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

('use strict');

// Imports
const path = require('path');
const assert = require('yeoman-assert');
const testlab = require('@loopback/testlab');

const expect = testlab.expect;
const TestSandbox = testlab.TestSandbox;

const generator = path.join(__dirname, '../../../generators/model');
const tests = require('../lib/artifact-generator')(generator);
const baseTests = require('../lib/base-generator')(generator);
const testUtils = require('../../test-utils');

// Test Sandbox
const SANDBOX_PATH = path.resolve(__dirname, '../.sandbox');
const sandbox = new TestSandbox(SANDBOX_PATH);

// Basic CLI Input
const basicCLIInput = {
  name: 'test',
};

// Expected File Paths & File Contents
const expectedIndexFile = path.join(SANDBOX_PATH, 'src/models/index.ts');
const expectedModelFile = path.join(SANDBOX_PATH, 'src/models/test.model.ts');

// Base Tests
describe('model-generator extending BaseGenerator', baseTests);
describe('generator-loopback4:model', tests);

describe('lb4 model integration', () => {
  beforeEach('reset sandbox', () => sandbox.reset());

  it('does not run without package.json', () => {
    return expect(
      testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {excludePackageJSON: true}),
        )
        .withPrompts(basicCLIInput),
    ).to.be.rejectedWith(/No package.json found in/);
  });

  it('does not run without the "@loopback/core" dependency', () => {
    return expect(
      testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {excludeLoopbackCore: true}),
        )
        .withPrompts(basicCLIInput),
    ).to.be.rejectedWith(/No `@loopback\/core` package found/);
  });

  it('does not run if passed an invalid model from command line', () => {
    return expect(
      testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {excludeLoopbackCore: false}),
        )
        .withArguments('myNewModel --base InvalidModel'),
    ).to.be.rejectedWith(/Model was not found in/);
  });

  it('run if passed a valid base model from command line', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH))
      .withArguments('test --base Model');

    assert.file(expectedModelFile);
  });

  describe('model generator', () => {
    it('scaffolds correct files with input', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH))
        .withPrompts({
          name: 'test',
          propName: null,
        });

      basicModelFileChecks();
    });

    it('scaffolds correct files with model base class', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH))
        .withPrompts({
          name: 'test',
          propName: null,
          modelBaseClass: 'Model',
          allowAdditionalProperties: false,
        });

      assert.file(expectedModelFile);
      assert.file(expectedIndexFile);

      // Actual Model File
      assert.fileContent(
        expectedModelFile,
        /import {Model, model, property} from '@loopback\/repository';/,
      );
      assert.fileContent(expectedModelFile, /@model()/);
      assert.fileContent(
        expectedModelFile,
        /export class Test extends Model {/,
      );
    });

    it('scaffolds correct files with model custom class', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {includeDummyModel: true}),
        )
        .withPrompts({
          name: 'test',
          propName: null,
          modelBaseClass: 'ProductReview',
        });

      assert.file(expectedModelFile);
      assert.file(expectedIndexFile);

      // Actual Model File
      assert.fileContent(
        expectedModelFile,
        /import {model, property} from '@loopback\/repository';/,
      );
      assert.fileContent(expectedModelFile, /@model()/);
      assert.fileContent(
        expectedModelFile,
        /export class Test extends ProductReview {/,
      );
    });

    it('scaffolds model with strict setting disabled', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH))
        .withPrompts({
          name: 'test',
          propName: null,
          modelBaseClass: 'Entity',
          allowAdditionalProperties: true,
        });

      assert.file(expectedModelFile);
      assert.file(expectedIndexFile);

      assert.fileContent(
        expectedModelFile,
        /import {Entity, model, property} from '@loopback\/repository';/,
      );
      assert.fileContent(
        expectedModelFile,
        /@model\({settings: {"strict":false}}\)/,
      );
      assert.fileContent(
        expectedModelFile,
        /export class Test extends Entity {/,
      );
      assert.fileContent(expectedModelFile, /\[prop: string\]: any;/);
    });

    it('scaffolds correct files with args', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH))
        .withArguments('test')
        .withPrompts({
          propName: null,
        });

      basicModelFileChecks();
    });
  });
});

describe('model generator using --config option', () => {
  it('create models with valid json', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH))
      .withArguments(['--config', '{"name":"test", "base":"Entity"}', '--yes']);

    basicModelFileChecks();
  });

  it('does not run if pass invalid json', () => {
    return expect(
      testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH))
        .withArguments([
          '--config',
          '{"name":"test", "base":"InvalidBaseModel"}',
          '--yes',
        ]),
    ).to.be.rejectedWith(/Model was not found in/);
  });
});

// Checks to ensure expected files exist with the current file contents
function basicModelFileChecks() {
  assert.file(expectedModelFile);
  assert.file(expectedIndexFile);

  // Actual Model File
  assert.fileContent(
    expectedModelFile,
    /import {Entity, model, property} from '@loopback\/repository';/,
  );
  assert.fileContent(expectedModelFile, /@model()/);
  assert.fileContent(expectedModelFile, /export class Test extends Entity {/);
  assert.fileContent(
    expectedModelFile,
    /constructor\(data\?\: Partial<Test>\) {/,
  );
  assert.fileContent(expectedModelFile, /super\(data\)/);

  // Actual Index File
  assert.fileContent(expectedIndexFile, /export \* from '.\/test.model';/);
}
