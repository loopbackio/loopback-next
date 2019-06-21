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
const basicModelFileChecks = require('../lib/file-check').basicModelFileChecks;

// Test Sandbox
const SANDBOX_PATH = path.resolve(__dirname, '../.sandbox');
const DISCOVER_SANDBOX_FILES = require('../../fixtures/discover').SANDBOX_FILES;
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

  it('will discover a model through a datasource', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(SANDBOX_PATH, () =>
        testUtils.givenLBProject(SANDBOX_PATH, {
          additionalFiles: DISCOVER_SANDBOX_FILES,
        }),
      )
      .withArguments('--dataSource mem --table Test');
    assert.file(expectedModelFile);
  });
  it('will fail gracefully if datasource discovery does not find the model ', async () => {
    return expect(
      testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: DISCOVER_SANDBOX_FILES,
          }),
        )
        .withArguments('--dataSource mem --table Foo'),
    ).to.be.rejectedWith(/Could not locate table:/);
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

      basicModelFileChecks(expectedModelFile, expectedIndexFile);
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
        /@model\({settings: {strict: false}}\)/,
      );
      assert.fileContent(
        expectedModelFile,
        /export class Test extends Entity {/,
      );
      assert.fileContent(
        expectedModelFile,
        /eslint-disable-next-line \@typescript-eslint\/no-explicit-any/,
      );
      assert.fileContent(expectedModelFile, /\[prop: string\]: any;/);
    });

    it('scaffolds empty model relation interface and relation type', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH))
        .withPrompts({
          name: 'test',
          propName: null,
          modelBaseClass: 'Entity',
          allowAdditionalProperties: false,
        });

      assert.file(expectedModelFile);
      assert.file(expectedIndexFile);

      assert.fileContent(
        expectedModelFile,
        /import {Entity, model, property} from '@loopback\/repository';/,
      );
      assert.fileContent(
        expectedModelFile,
        /export type TestWithRelations = Test & TestRelations;/,
      );
      assert.fileContent(
        expectedModelFile,
        /export interface TestRelations {\n {2}\/\/ describe navigational properties here\n}/,
      );
    });

    it('scaffolds correct files with args', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH))
        .withArguments('test')
        .withPrompts({
          propName: null,
        });

      basicModelFileChecks(expectedModelFile, expectedIndexFile);
    });
  });
});

describe('model generator using --config option', () => {
  it('create models with valid json', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH))
      .withArguments(['--config', '{"name":"test", "base":"Entity"}', '--yes']);

    basicModelFileChecks(expectedModelFile, expectedIndexFile);
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

  describe('model generator using --config option with model settings', () => {
    it('creates a model with valid settings', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH))
        .withArguments([
          '--config',
          '{"name":"test", "base":"Entity", \
          "modelSettings": {"annotations": \
          [{"destinationClass": "class1","argument": 0}],\
          "foreignKeys": {"fk_destination": {"name": "fk_destination"}}},\
          "allowAdditionalProperties":true}',
          '--yes',
        ]);

      basicModelFileChecks(expectedModelFile, expectedIndexFile);

      assert.fileContent(
        expectedModelFile,
        /@model\({\n {2}settings: {\n {4}annotations: \[{destinationClass: 'class1', argument: 0}],\n {4}foreignKeys: {fk_destination: {name: 'fk_destination'}},\n {4}strict: false\n {2}}\n}\)/,
      );
    });
  });
});
