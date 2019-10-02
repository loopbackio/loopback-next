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
  'order.model.ts',
  'order-class.model.ts',
  'order-class-type.model.ts',
];
const controllerFileName = [
  'order-customer.controller.ts',
  'order-class-customer-class.controller.ts',
  'order-class-type-customer-class-type.controller.ts',
];
const repositoryFileName = [
  'order.repository.ts',
  'order-class.repository.ts',
  'order-class-type.repository.ts',
];

describe('lb4 relation', function() {
  // eslint-disable-next-line no-invalid-this
  this.timeout(50000);

  it("rejects relation when destination model doesn't have primary Key", async () => {
    await sandbox.reset();
    const prompt = {
      relationType: 'belongsTo',
      sourceModel: 'Customer',
      destinationModel: 'Nokey',
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
    ).to.be.rejectedWith(/Target model primary key does not exist/);
  });

  it('rejects relation when models does not exist', async () => {
    await sandbox.reset();
    const prompt = {
      relationType: 'belongsTo',
      sourceModel: 'Customer',
      destinationModel: 'Nokey',
    };

    return expect(
      testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: [
              // no model/repository files in this project
            ],
          }),
        )
        .withPrompts(prompt),
    ).to.be.rejectedWith(/No models found/);
  });

  it('updates property decorator when property already exist in the model', async () => {
    await sandbox.reset();
    const prompt = {
      relationType: 'belongsTo',
      sourceModel: 'Order',
      destinationModel: 'Customer',
    };

    await testUtils
      .executeGenerator(generator)
      .inDir(SANDBOX_PATH, () =>
        testUtils.givenLBProject(SANDBOX_PATH, {
          additionalFiles: [
            SourceEntries.CustomerModelWithOrdersProperty,
            SourceEntries.OrderModelModelWithCustomerIdProperty,
            SourceEntries.CustomerRepository,
            SourceEntries.OrderRepository,
          ],
        }),
      )
      .withPrompts(prompt);

    const expectedFile = path.join(
      SANDBOX_PATH,
      MODEL_APP_PATH,
      'order.model.ts',
    );

    const relationalPropertyRegEx = /\@belongsTo\(\(\) \=\> Customer\)/;
    assert.fileContent(expectedFile, relationalPropertyRegEx);
  });

  context('generates model relation with default values', () => {
    const promptArray = [
      {
        relationType: 'belongsTo',
        sourceModel: 'Order',
        destinationModel: 'Customer',
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'OrderClass',
        destinationModel: 'CustomerClass',
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'OrderClassType',
        destinationModel: 'CustomerClassType',
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

  context('generates model relation for existing property name', () => {
    const promptList = [
      {
        relationType: 'belongsTo',
        sourceModel: 'Order',
        destinationModel: 'Customer',
        relationName: 'myRelation',
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'OrderClass',
        destinationModel: 'CustomerClass',
        relationName: 'myRelation',
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'OrderClassType',
        destinationModel: 'CustomerClassType',
        relationName: 'myRelation',
      },
    ];

    it('verifies that a preexisting property will be overwritten', async () => {
      await sandbox.reset();
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withPrompts(promptList[0]);

      const sourceFilePath = path.join(
        SANDBOX_PATH,
        MODEL_APP_PATH,
        sourceFileName[0],
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
        relationName: 'customerPK',
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'OrderClass',
        destinationModel: 'CustomerClass',
        relationName: 'customerPK',
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'OrderClassType',
        destinationModel: 'CustomerClassType',
        relationName: 'customerPK',
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

      it('relation name should be customerPK', async () => {
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

  context('checks if the controller file created ', () => {
    const promptArray = [
      {
        relationType: 'belongsTo',
        sourceModel: 'Order',
        destinationModel: 'Customer',
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'OrderClass',
        destinationModel: 'CustomerClass',
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'OrderClassType',
        destinationModel: 'CustomerClassType',
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

      it('new controller file created', async () => {
        const filePath = path.join(
          SANDBOX_PATH,
          CONTROLLER_PATH,
          controllerFileName[i],
        );
        assert.file(filePath);
      });

      it('checks controller content with belongsTo relation', async () => {
        const filePath = path.join(
          SANDBOX_PATH,
          CONTROLLER_PATH,
          controllerFileName[i],
        );
        assert.file(filePath);
        expectFileToMatchSnapshot(filePath);
      });

      it('the new controller file added to index.ts file', async () => {
        const indexFilePath = path.join(
          SANDBOX_PATH,
          CONTROLLER_PATH,
          'index.ts',
        );

        expectFileToMatchSnapshot(indexFilePath);
      });
    }
  });

  context('checks generated source class repository ', () => {
    const promptArray = [
      {
        relationType: 'belongsTo',
        sourceModel: 'Order',
        destinationModel: 'Customer',
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'OrderClass',
        destinationModel: 'CustomerClass',
        registerInclusionResolver: true,
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'OrderClassType',
        destinationModel: 'CustomerClassType',
        registerInclusionResolver: false,
      },
    ];

    const sourceClassnames = ['Order', 'OrderClass', 'OrderClassType'];

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

          assert.file(sourceFilePath);
          expectFileToMatchSnapshot(sourceFilePath);
        },
      );
    }
  });
});
