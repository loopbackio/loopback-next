// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const testlab = require('@loopback/testlab');
const expect = testlab.expect;
const TestSandbox = testlab.TestSandbox;
const generator = path.join(__dirname, '../../../generators/relation');
const SANDBOX_FILES = require('../../fixtures/relation').SANDBOX_FILES2;
const SANDBOX_FILES3 = require('../../fixtures/relation').SANDBOX_FILES3;
const SANDBOX_FILES4 = require('../../fixtures/relation').SANDBOX_FILES4;
const SANDBOX_FILES5 = require('../../fixtures/relation').SANDBOX_FILES5;
const SANDBOX_FILES6 = require('../../fixtures/relation').SANDBOX_FILES6;
const testUtils = require('../../test-utils');

// Test Sandbox
const SANDBOX_PATH = path.resolve(__dirname, '..', '.sandbox');
const CONTROLLER_PATH = 'src/controllers';
const MODEL_PATH = 'src/models';
const sandbox = new TestSandbox(SANDBOX_PATH);

describe('lb4 relation', function() {
  // eslint-disable-next-line no-invalid-this
  this.timeout(30000);

  beforeEach('reset sandbox', async () => {
    await sandbox.reset();
  }); // special cases regardless of the repository type

  context('Execute relation with wrong relation type', () => {
    it('rejects invalid relation type provided via CLI arguments', () => {
      return expect(
        testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withArguments('--relationType foo'),
      ).to.be.rejectedWith(/Incorrect relation type/);
    });
    it('rejects invalid relation type provided via prompt', () => {
      const prompt = {
        relationType: 'foo',
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
      ).to.be.rejectedWith(/Incorrect relation type/);
    });
  });

  context('Execute relation with wrong source model', () => {
    it('rejects unknown source model set via CLI arguments', () => {
      return expect(
        testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withArguments('--relationType hasMany --sourceModel=blabla'),
      ).to.be.rejectedWith(/\"blabla\" model does not exist\./);
    });
    it('rejects unknown source model set via prompt', () => {
      const prompt = {
        relationType: 'hasMany',
        sourceModel: 'blabla',
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
      ).to.be.rejectedWith(/\"blabla\" model does not exist\./);
    });
  });

  context('Execute relation with wrong destination model', () => {
    it('rejects unknown destination model set via CLI arguments', () => {
      return expect(
        testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withArguments(
            '--relationType hasMany --sourceModel=Customer --destinationModel=blabla',
          ),
      ).to.be.rejectedWith(/\"blabla\" model does not exist\./);
    });
    it('rejects unknown destination model set via prompt', () => {
      const prompt = {
        relationType: 'hasMany',
        sourceModel: 'Customer',
        destinationModel: 'blabla',
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
      ).to.be.rejectedWith(/\"blabla\" model does not exist\./);
    });
  });
  context(
    'Execute hasMany relation with missing primary key in source model',
    () => {
      it("rejects relation when source model doesn't have primary Key", () => {
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
    },
  );

  context(
    'Execute belongsTo relation with missing primary key in destination model',
    () => {
      it("rejects relation when destination model doesn't have primary Key", () => {
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
    },
  );
  context('add new controller to exisiting index file', () => {
    it('check if the controller exported to index file ', async () => {
      const prompt = {
        relationType: 'hasMany',
        sourceModel: 'Customer',
        destinationModel: 'Order',
      };

      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withPrompts(prompt);
      const expectedControllerIndexFile = path.join(
        SANDBOX_PATH,
        CONTROLLER_PATH,
        'index.ts',
      );

      assert.equalsFileContent(
        expectedControllerIndexFile,
        "export * from './customer.controller';\nexport * from './customer-order.controller';\n",
      );
    });
  });

  context('add controller to existing index file only once', () => {
    it('check if the controller exported to index file only once', async () => {
      const prompt = {
        relationType: 'belongsTo',
        sourceModel: 'Order',
        destinationModel: 'Customer',
      };

      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES4,
          }),
        )
        .withPrompts(prompt);
      const expectedControllerIndexFile = path.join(
        SANDBOX_PATH,
        CONTROLLER_PATH,
        'index.ts',
      );

      assert.equalsFileContent(
        expectedControllerIndexFile,
        "export * from './order-customer.controller';\n",
      );
    });
  });

  context('Execute relation when models does not exist', () => {
    it('rejects relation when models does not exist', () => {
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
              additionalFiles: SANDBOX_FILES3,
            }),
          )
          .withPrompts(prompt),
      ).to.be.rejectedWith(/No models found/);
    });
  });

  context('Execute relation when property already exist in the model', () => {
    it('rejects relation when relation already exist in the model', () => {
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
              additionalFiles: SANDBOX_FILES5,
            }),
          )
          .withPrompts(prompt),
      ).to.be.rejectedWith(
        /relational property orders already exist in the model Customer/,
      );
    });
    it('update property decorator when property already exist in the model', async () => {
      const prompt = {
        relationType: 'belongsTo',
        sourceModel: 'Order',
        destinationModel: 'Customer',
      };

      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES6,
          }),
        )
        .withPrompts(prompt);

      const expectedFile = path.join(
        SANDBOX_PATH,
        MODEL_PATH,
        'order.model.ts',
      );

      const relationalPropertyRegEx = /\@belongsTo\(\(\) \=\> Customer\)/;
      assert.fileContent(expectedFile, relationalPropertyRegEx);
    });
  });
});
