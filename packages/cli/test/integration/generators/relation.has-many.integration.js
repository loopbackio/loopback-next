// Copyright IBM Corp. 2019. All Rights Reserved.
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
const SANDBOX_PATH = path.resolve(__dirname, '..', '.sandbox');
const MODEL_APP_PATH = 'src/models';
const CONTROLLER_PATH = 'src/controllers';
const REPOSITORY_APP_PATH = 'src/repositories';

const sandbox = new TestSandbox(SANDBOX_PATH);

const sourceFileName = [
  'customer.model.ts',
  'customer-class.model.ts',
  'customer-class-type.model.ts',
];
const targetFileName = [
  'order.model.ts',
  'order-class.model.ts',
  'order-class-type.model.ts',
];
const controllerFileName = [
  'customer-order.controller.ts',
  'customer-class-order-class.controller.ts',
  'customer-class-type-order-class-type.controller.ts',
];
const repositoryFileName = [
  'customer.repository.ts',
  'customer-class.repository.ts',
  'customer-class-type.repository.ts',
];

describe('lb4 relation HasMany', function() {
  // eslint-disable-next-line no-invalid-this
  this.timeout(30000);

  it("rejects relation when source model doesn't have primary Key", async () => {
    await sandbox.reset();

    const prompt = {
      relationType: 'hasMany',
      sourceModel: 'Nokey',
      destinationModel: 'Customer',
    };

    return expect(
      testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withPrompts(prompt),
    ).to.be.rejectedWith(/Source model primary key does not exist\./);
  });

  it('rejects relation when relation already exist in the model', async () => {
    await sandbox.reset();

    const prompt = {
      relationType: 'hasMany',
      sourceModel: 'Customer',
      destinationModel: 'Order',
    };

    return expect(
      testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: [
              SourceEntries.CustomerModelWithOrdersProperty,
              SourceEntries.OrderModel,
              SourceEntries.CustomerRepository,
              SourceEntries.OrderRepository,
            ],
          }),
        )
        .withPrompts(prompt),
    ).to.be.rejectedWith(
      /relational property orders already exist in the model Customer/,
    );
  });

  // special cases regardless of the repository type
  context('generates model relation with default values', () => {
    const promptArray = [
      {
        relationType: 'hasMany',
        sourceModel: 'Customer',
        destinationModel: 'Order',
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClass',
        destinationModel: 'OrderClass',
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClassType',
        destinationModel: 'OrderClassType',
      },
    ];

    promptArray.forEach(function(multiItemPrompt, i) {
      describe('answers ' + JSON.stringify(multiItemPrompt), () => {
        suite(multiItemPrompt, i);
      });
    });

    function suite(multiItemPrompt, i) {
      before(async function runGeneratorWithAnswers() {
        await sandbox.reset();
        await testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withPrompts(multiItemPrompt);
      });

      it('has correct default imports', async () => {
        const sourceFilePath = path.join(
          SANDBOX_PATH,
          MODEL_APP_PATH,
          sourceFileName[i],
        );
        assert.file(sourceFilePath);
        expectFileToMatchSnapshot(sourceFilePath);
      });
    }
  });

  context('generates model relation with custom relation name', () => {
    const promptArray = [
      {
        relationType: 'hasMany',
        sourceModel: 'Customer',
        destinationModel: 'Order',
        relationName: 'myOrders',
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClass',
        destinationModel: 'OrderClass',
        relationName: 'myOrders',
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClassType',
        destinationModel: 'OrderClassType',
        relationName: 'myOrders',
      },
    ];

    promptArray.forEach(function(multiItemPrompt, i) {
      describe('answers ' + JSON.stringify(multiItemPrompt), () => {
        suite(multiItemPrompt, i);
      });
    });

    function suite(multiItemPrompt, i) {
      before(async function runGeneratorWithAnswers() {
        await sandbox.reset();
        await testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withPrompts(multiItemPrompt);
      });

      it('relation name should be myOrders', async () => {
        const sourceFilePath = path.join(
          SANDBOX_PATH,
          MODEL_APP_PATH,
          sourceFileName[i],
        );
        const targetFilePath = path.join(
          SANDBOX_PATH,
          MODEL_APP_PATH,
          targetFileName[i],
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
        relationType: 'hasMany',
        sourceModel: 'Customer',
        destinationModel: 'Order',
        foreignKeyName: 'mykey',
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClass',
        destinationModel: 'OrderClass',
        foreignKeyName: 'mykey',
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClassType',
        destinationModel: 'OrderClassType',
        foreignKeyName: 'mykey',
      },
    ];

    promptArray.forEach(function(multiItemPrompt, i) {
      describe('answers ' + JSON.stringify(multiItemPrompt), () => {
        suite(multiItemPrompt, i);
      });
    });

    function suite(multiItemPrompt, i) {
      before(async function runGeneratorWithAnswers() {
        await sandbox.reset();
        await testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withPrompts(multiItemPrompt);
      });

      it('add the keyTo to the source model', async () => {
        const sourceFilePath = path.join(
          SANDBOX_PATH,
          MODEL_APP_PATH,
          sourceFileName[i],
        );
        const targetFilePath = path.join(
          SANDBOX_PATH,
          MODEL_APP_PATH,
          targetFileName[i],
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
        relationType: 'hasMany',
        sourceModel: 'Customer',
        destinationModel: 'Order',
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClass',
        destinationModel: 'OrderClass',
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClassType',
        destinationModel: 'OrderClassType',
      },
    ];

    promptArray.forEach(function(multiItemPrompt, i) {
      describe('answers ' + JSON.stringify(multiItemPrompt), () => {
        suite(multiItemPrompt, i);
      });
    });

    function suite(multiItemPrompt, i) {
      before(async function runGeneratorWithAnswers() {
        await sandbox.reset();
        await testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withPrompts(multiItemPrompt);
      });

      it('new controller file has been created', async () => {
        const filePath = path.join(
          SANDBOX_PATH,
          CONTROLLER_PATH,
          controllerFileName[i],
        );
        assert.file(filePath);
      });

      it('checks controller content with hasMany relation', async () => {
        const filePath = path.join(
          SANDBOX_PATH,
          CONTROLLER_PATH,
          controllerFileName[i],
        );
        expectFileToMatchSnapshot(filePath);
      });
    }
  });

  context('checks generated source class repository', () => {
    const promptArray = [
      {
        relationType: 'hasMany',
        sourceModel: 'Customer',
        destinationModel: 'Order',
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClass',
        destinationModel: 'OrderClass',
        registerInclusionResolver: true,
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClassType',
        destinationModel: 'OrderClassType',
        registerInclusionResolver: false,
      },
    ];

    const sourceClassnames = ['Customer', 'CustomerClass', 'CustomerClassType'];
    promptArray.forEach(function(multiItemPrompt, i) {
      describe('answers ' + JSON.stringify(multiItemPrompt), () => {
        suite(multiItemPrompt, i);
      });
    });

    function suite(multiItemPrompt, i) {
      before(async function runGeneratorWithAnswers() {
        await sandbox.reset();
        await testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withPrompts(multiItemPrompt);
      });

      it(
        'generates ' +
          sourceClassnames[i] +
          ' repository file with different inputs',
        async () => {
          const sourceFilePath = path.join(
            SANDBOX_PATH,
            REPOSITORY_APP_PATH,
            repositoryFileName[i],
          );

          expectFileToMatchSnapshot(sourceFilePath);
        },
      );
    }
  });
});
