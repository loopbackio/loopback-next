// Copyright IBM Corp. 2020. All Rights Reserved.
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

const sourceFileName = 'customer.model.ts';
const targetFileName = 'address.model.ts';
const controllerFileName = 'customer-address.controller.ts';
const repositoryFileName = 'customer.repository.ts';

describe('lb4 relation HasOne', /** @this {Mocha.Suite} */ function () {
  this.timeout(30000);

  it('rejects relation when the corresponding repository does not exist', async () => {
    await sandbox.reset();

    const prompt = {
      relationType: 'hasOne',
      sourceModel: 'NoRepo',
      destinationModel: 'Customer',
    };

    return expect(
      testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withPrompts(prompt),
    ).to.be.rejectedWith(
      /NoRepoRepository class does not exist\. Please create repository first with \"lb4 repository\" command\./,
    );
  });

  it('rejects relation when source key already exist in the model', async () => {
    await sandbox.reset();

    const prompt = {
      relationType: 'hasOne',
      sourceModel: 'Customer',
      destinationModel: 'Address',
    };

    return expect(
      testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: [
              SourceEntries.CustomerModelWithAddressProperty,
              SourceEntries.AddressModel,
              SourceEntries.CustomerRepository,
              SourceEntries.AddressRepository,
            ],
          }),
        )
        .withPrompts(prompt),
    ).to.be.rejectedWith(
      /relational property address already exist in the model Customer/,
    );
  });

  context('Execute relation with existing relation name', () => {
    it('rejects if the relation name already exists in the repository', async () => {
      await sandbox.reset();

      const prompt = {
        relationType: 'hasOne',
        sourceModel: 'Address',
        destinationModel: 'Customer',
        relationName: 'myCustomer',
      };

      return expect(
        testUtils
          .executeGenerator(generator)
          .inDir(sandbox.path, () =>
            testUtils.givenLBProject(sandbox.path, {
              additionalFiles: [
                SourceEntries.CustomerModel,
                SourceEntries.AddressModel,
                SourceEntries.CustomerRepository,
                SourceEntries.AddressRepository,
              ],
            }),
          )
          .withPrompts(prompt),
      ).to.be.rejectedWith(
        `relation myCustomer already exists in the repository AddressRepository.`,
      );
    });
  });

  // special cases regardless of the repository type
  context('generates model relation with default values', () => {
    const promptArray = [
      {
        relationType: 'hasOne',
        sourceModel: 'Customer',
        destinationModel: 'Address',
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

  context('generates model relation with custom relation name', () => {
    const promptArray = [
      {
        relationType: 'hasOne',
        sourceModel: 'Customer',
        destinationModel: 'Address',
        relationName: 'myAddress',
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

      it('relation name should be myAddress', async () => {
        const sourceFilePath = path.join(
          sandbox.path,
          MODEL_APP_PATH,
          sourceFileName,
        );
        const targetFilePath = path.join(
          sandbox.path,
          MODEL_APP_PATH,
          targetFileName,
        );

        assert.file(sourceFilePath);
        assert.file(targetFilePath);
        expectFileToMatchSnapshot(sourceFilePath);
        expectFileToMatchSnapshot(targetFilePath);
      });
    }
  });

  context('generates model relation with custom foreignKey', () => {
    const promptArray = [
      {
        relationType: 'hasOne',
        sourceModel: 'Customer',
        destinationModel: 'Address',
        foreignKeyName: 'mykey',
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

      it('add the keyTo to the source model', async () => {
        const sourceFilePath = path.join(
          sandbox.path,
          MODEL_APP_PATH,
          sourceFileName,
        );
        const targetFilePath = path.join(
          sandbox.path,
          MODEL_APP_PATH,
          targetFileName,
        );

        assert.file(sourceFilePath);
        assert.file(targetFilePath);
        expectFileToMatchSnapshot(sourceFilePath);
        expectFileToMatchSnapshot(targetFilePath);
      });
    }
  });

  context('checks if the controller file created ', () => {
    const promptArray = [
      {
        relationType: 'hasOne',
        sourceModel: 'Customer',
        destinationModel: 'Address',
      },
      {
        relationType: 'hasOne',
        sourceModel: 'Customer',
        destinationModel: 'Address',
        relationName: 'myAddress',
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
          .withPrompts(multiItemPrompt);
      });

      it('new controller file has been created', async () => {
        const filePath = path.join(
          sandbox.path,
          CONTROLLER_PATH,
          controllerFileName,
        );
        assert.file(filePath);
      });

      it('checks controller content with hasOne relation', async () => {
        const filePath = path.join(
          sandbox.path,
          CONTROLLER_PATH,
          controllerFileName,
        );
        expectFileToMatchSnapshot(filePath);
      });
    }
  });

  context('checks generated source class repository', () => {
    const promptArray = [
      {
        relationType: 'hasOne',
        sourceModel: 'Customer',
        destinationModel: 'Address',
      },
      {
        relationType: 'hasOne',
        sourceModel: 'Customer',
        destinationModel: 'Address',
        registerInclusionResolver: false,
      },
    ];

    const sourceClass = 'Customer';
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

      it(
        'generates ' + sourceClass + ' repository file with different inputs',
        async () => {
          const sourceFilePath = path.join(
            sandbox.path,
            REPOSITORY_APP_PATH,
            repositoryFileName,
          );

          expectFileToMatchSnapshot(sourceFilePath);
        },
      );
    }
  });
});
