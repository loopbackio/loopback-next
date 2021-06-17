// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const {expect, TestSandbox} = require('@loopback/testlab');
const {expectFileToMatchSnapshot} = require('../../snapshots');

const generator = path.join(__dirname, '../../../generators/relation');
const {SANDBOX_FILES, SourceEntries} = require('../../fixtures/relation');
const testUtils = require('../../test-utils');

// Test Sandbox
const MODEL_APP_PATH = 'src/models';
const CONTROLLER_PATH = 'src/controllers';
const REPOSITORY_APP_PATH = 'src/repositories';
const sandbox = new TestSandbox(path.resolve(__dirname, '../.sandbox'));

const sourceFileName = 'order.model.ts';
const controllerFileName = 'order-customer.controller.ts';
const repositoryFileName = 'order.repository.ts';
// speed up tests by avoiding reading docs
const options = {
  sourceModelPrimaryKey: 'id',
  sourceModelPrimaryKeyType: 'number',
  destinationModelPrimaryKey: 'id',
  destinationModelPrimaryKeyType: 'number',
};

describe('lb4 relation', /** @this {Mocha.Suite} */ function () {
  this.timeout(30000);

  it('rejects relation when models does not exist', async () => {
    await sandbox.reset();
    const prompt = {
      relationType: 'belongsTo',
      sourceModel: 'Customer',
      destinationModel: 'NotExistModel',
    };

    return expect(
      testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: [
              // no model/repository files in this project
            ],
          }),
        )
        .withPrompts(prompt),
    ).to.be.rejectedWith(/No models found/);
  });

  context('generates model relation with default values', () => {
    const promptArray = [
      {
        relationType: 'belongsTo',
        sourceModel: 'Order',
        destinationModel: 'Customer',
      },
    ];

    promptArray.forEach(function (multiItemPrompt, i) {
      describe('answers ' + JSON.stringify(multiItemPrompt), () => {
        suite(multiItemPrompt, i);
      });
    });

    function suite(multiItemPrompt, i) {
      before(async function runGeneratorWithAnswers() {
        await sandbox.reset();
        await testUtils
          .executeGenerator(generator)
          .inDir(sandbox.path, () =>
            testUtils.givenLBProject(sandbox.path, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withPrompts(multiItemPrompt);
      });

      it('has correct default imports', async () => {
        const sourceFilePath = path.join(
          sandbox.path,
          MODEL_APP_PATH,
          sourceFileName,
        );

        assert.file(sourceFilePath);
        expectFileToMatchSnapshot(sourceFilePath);
      });
    }
  });

  context('generates model relation for existing property name', () => {
    const promptList = [
      {
        relationType: 'belongsTo',
        sourceModel: 'Order',
        destinationModel: 'Customer',
        foreignKeyName: 'customerId',
        relationName: 'customer',
      },
    ];

    it('verifies that a preexisting property will be overwritten', async () => {
      await sandbox.reset();

      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: [
              SourceEntries.CustomerModelWithOrdersProperty,
              SourceEntries.OrderModelModelWithCustomerIdProperty,
              SourceEntries.CustomerRepository,
              SourceEntries.OrderRepository,
            ],
          }),
        )
        .withOptions(options)
        .withPrompts(promptList[0]);

      const sourceFilePath = path.join(
        sandbox.path,
        MODEL_APP_PATH,
        'order.model.ts',
      );

      assert.file(sourceFilePath);
      expectFileToMatchSnapshot(sourceFilePath);
    });
  });

  context('generates model relation with custom relation name', () => {
    const promptArray = [
      {
        relationType: 'belongsTo',
        sourceModel: 'Order',
        destinationModel: 'Customer',
        foreignKeyName: 'customerId',
        relationName: 'my_customer',
      },
    ];
    promptArray.forEach(function (multiItemPrompt, i) {
      describe('answers ' + JSON.stringify(multiItemPrompt), () => {
        suite(multiItemPrompt, i);
      });
    });

    function suite(multiItemPrompt, i) {
      before(async function runGeneratorWithAnswers() {
        await sandbox.reset();
        await testUtils
          .executeGenerator(generator)
          .inDir(sandbox.path, () =>
            testUtils.givenLBProject(sandbox.path, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withOptions(options)
          .withPrompts(multiItemPrompt);
      });

      it('relation name should be my_customer', async () => {
        const sourceFilePath = path.join(
          sandbox.path,
          MODEL_APP_PATH,
          sourceFileName,
        );

        assert.file(sourceFilePath);
        expectFileToMatchSnapshot(sourceFilePath);
      });
    }
  });

  context('checks if the controller file created ', () => {
    const promptArray = [
      {
        relationType: 'belongsTo',
        sourceModel: 'Order',
        destinationModel: 'Customer',
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'Order',
        destinationModel: 'Customer',
        relationName: 'my_customer',
      },
    ];

    promptArray.forEach(function (multiItemPrompt) {
      describe('answers ' + JSON.stringify(multiItemPrompt), () => {
        suite(multiItemPrompt);
      });
    });

    function suite(multiItemPrompt) {
      before(async function runGeneratorWithAnswers() {
        await sandbox.reset();
        await testUtils
          .executeGenerator(generator)
          .inDir(sandbox.path, () =>
            testUtils.givenLBProject(sandbox.path, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withOptions(options)
          .withPrompts(multiItemPrompt);
      });

      it('checks controller content with belongsTo relation', async () => {
        const filePath = path.join(
          sandbox.path,
          CONTROLLER_PATH,
          controllerFileName,
        );
        assert.file(filePath);
        expectFileToMatchSnapshot(filePath);
      });

      it('the new controller file added to index.ts file', async () => {
        const indexFilePath = path.join(
          sandbox.path,
          CONTROLLER_PATH,
          'index.ts',
        );

        expectFileToMatchSnapshot(indexFilePath);
      });
    }
  });

  context('checks generated source class repository', () => {
    const promptArray = [
      {
        relationType: 'belongsTo',
        sourceModel: 'Order',
        destinationModel: 'Customer',
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'Order',
        destinationModel: 'Customer',
        relationName: 'custom_name',
        registerInclusionResolver: false,
      },
    ];

    const sourceClassnames = ['Order', 'Order'];

    promptArray.forEach(function (multiItemPrompt, i) {
      describe('answers ' + JSON.stringify(multiItemPrompt), () => {
        suite(multiItemPrompt, i);
      });
    });

    function suite(multiItemPrompt, i) {
      before(async function runGeneratorWithAnswers() {
        await sandbox.reset();
        await testUtils
          .executeGenerator(generator)
          .inDir(sandbox.path, () =>
            testUtils.givenLBProject(sandbox.path, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withOptions(options)
          .withPrompts(multiItemPrompt);
      });

      it(
        'generates ' +
          sourceClassnames[i] +
          ' repository file with different inputs',
        async () => {
          const sourceFilePath = path.join(
            sandbox.path,
            REPOSITORY_APP_PATH,
            repositoryFileName,
          );

          assert.file(sourceFilePath);
          expectFileToMatchSnapshot(sourceFilePath);
        },
      );
    }
  });
});
