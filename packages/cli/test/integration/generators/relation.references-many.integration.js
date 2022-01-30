// Copyright IBM Corp. 2019,2020. All Rights Reserved.
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
const REPOSITORY_APP_PATH = 'src/repositories';
const sandbox = new TestSandbox(path.resolve(__dirname, '../.sandbox'));

const sourceFileName = 'customer.model.ts';
const repositoryFileName = 'customer.repository.ts';
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
      relationType: 'referencesMany',
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
        relationType: 'referencesMany',
        sourceModel: 'Customer',
        destinationModel: 'Account',
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
        relationType: 'referencesMany',
        sourceModel: 'Customer',
        destinationModel: 'Account',
        foreignKeyName: 'accountIds',
        relationName: 'accounts',
      },
    ];

    it('verifies that a preexisting property will be overwritten', async () => {
      await sandbox.reset();

      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: [
              SourceEntries.AccountModel,
              SourceEntries.CustomerModelWithAccountIdsProperty,
              SourceEntries.CustomerRepository,
              SourceEntries.AccountRepository,
            ],
          }),
        )
        .withOptions(options)
        .withPrompts(promptList[0]);

      const sourceFilePath = path.join(
        sandbox.path,
        MODEL_APP_PATH,
        'customer.model.ts',
      );

      assert.file(sourceFilePath);
      expectFileToMatchSnapshot(sourceFilePath);
    });
  });

  context('generates model relation with custom relation name', () => {
    const promptArray = [
      {
        relationType: 'referencesMany',
        sourceModel: 'Customer',
        destinationModel: 'Account',
        foreignKeyName: 'accountIds',
        relationName: 'my_accounts',
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

      it('relation name should be my_accounts', async () => {
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

  context('checks generated source class repository', () => {
    const promptArray = [
      {
        relationType: 'referencesMany',
        sourceModel: 'Customer',
        destinationModel: 'Account',
      },
      {
        relationType: 'referencesMany',
        sourceModel: 'Customer',
        destinationModel: 'Account',
        relationName: 'custom_name',
        registerInclusionResolver: false,
      },
    ];

    const sourceClassnames = ['Customer', 'Customer'];

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
