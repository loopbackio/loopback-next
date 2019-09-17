// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const testlab = require('@loopback/testlab');

const expect = testlab.expect;
const TestSandbox = testlab.TestSandbox;

const ControllerGenerator = require('../../../generators/controller');
const generator = path.join(__dirname, '../../../generators/controller');
const tests = require('../lib/artifact-generator')(generator);
const baseTests = require('../lib/base-generator')(generator);
const testUtils = require('../../test-utils');

const {expectFileToMatchSnapshot} = require('../../snapshots');

// Test Sandbox
const SANDBOX_PATH = path.resolve(__dirname, '..', '.sandbox');
const sandbox = new TestSandbox(SANDBOX_PATH);

// CLI Inputs
const basicCLIInput = {
  name: 'productReview',
};
const restCLIInput = {
  name: 'productReview',
  controllerType: ControllerGenerator.REST,
  id: 'productId',
  idType: 'number',
};

// Expected File Name
const filePath = path.join(
  SANDBOX_PATH,
  '/src/controllers/product-review.controller.ts',
);

// Base Tests
describe('controller-generator extending BaseGenerator', baseTests);
describe('generator-loopback4:controller', tests);

describe('lb4 controller', () => {
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

  it('does not run without "@loopback/core" as a dependency', () => {
    return expect(
      testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {excludeLoopbackCore: true}),
        )
        .withPrompts(basicCLIInput),
    ).to.be.rejectedWith(/No `@loopback\/core` package found/);
  });

  describe('basic controller', () => {
    it('scaffolds correct file with input', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH))
        .withPrompts(basicCLIInput);

      checkBasicContents();
    });

    it('scaffolds correct file with args', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH))
        .withArguments('productReview');

      assert.file(filePath);
      checkBasicContents();
    });
  });

  describe('REST CRUD controller', () => {
    const restCLIInputComplete = Object.assign(
      {},
      {
        modelName: 'ProductReview',
        repositoryName: 'BarRepository',
      },
      restCLIInput,
    );

    it('creates REST CRUD template with valid input - id omitted', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            includeDummyModel: true,
            includeDummyRepository: true,
          }),
        )
        .withPrompts(restCLIInputComplete);

      checkRestCrudContents({idOmitted: true});
    });

    it('creates REST CRUD template with valid input', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            includeDummyModel: true,
            includeDummyRepository: true,
          }),
        )
        .withPrompts(
          Object.assign({}, restCLIInputComplete, {idOmitted: false}),
        );

      checkRestCrudContents({idOmitted: false});
    });

    describe('HTTP REST path', () => {
      it('defaults correctly', async () => {
        await testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              includeDummyModel: true,
              includeDummyRepository: true,
            }),
          )
          .withPrompts(restCLIInputComplete);

        checkRestPaths('/product-reviews');
      });

      it('honors custom HTTP PATHs', async () => {
        const customPathInput = Object.assign(restCLIInputComplete, {
          httpPathName: '/customer-orders',
        });

        await testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              includeDummyModel: true,
              includeDummyRepository: true,
            }),
          )
          .withPrompts(customPathInput);

        checkRestPaths('/customer-orders');
      });
    });

    it('fails when no model is given', () => {
      const noModelInput = Object.assign(
        {
          repositoryName: 'BarRepository',
        },
        restCLIInput,
      );

      return expect(
        testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              includeDummyRepository: true,
            }),
          )
          .withPrompts(noModelInput),
      ).to.be.rejectedWith(/No models found in /);
    });

    it('fails when no repository is given', () => {
      const noRepositoryInput = Object.assign(
        {
          modelName: 'ProductReview',
        },
        restCLIInput,
      );

      return expect(
        testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {includeDummyModel: true}),
          )
          .withPrompts(noRepositoryInput),
      ).to.be.rejectedWith(/No repositories found in /);
    });

    it('fails when no model directory present', () => {
      return expect(
        testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              excludeModelsDir: true,
              includeDummyRepository: true,
            }),
          )
          .withPrompts(restCLIInputComplete),
      ).to.be.rejectedWith(
        /ENOENT: no such file or directory, scandir(.*?)models\b/,
      );
    });

    it('fails when no repository directory present', () => {
      return expect(
        testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              excludeRepositoriesDir: true,
              includeDummyModel: true,
            }),
          )
          .withPrompts(restCLIInputComplete),
      ).to.be.rejectedWith(
        /ENOENT: no such file or directory, scandir(.*?)repositories\b/,
      );
    });
  });
});

/**
 * Helper function to check the contents of a basic controller
 */
function checkBasicContents() {
  expectFileToMatchSnapshot(filePath);
}

/**
 * Assertions against the template to determine if it contains the
 * required signatures for a REST CRUD controller, specifically to ensure
 * that decorators are grouped correctly (for their corresponding
 * target functions)
 */
function checkRestCrudContents(options) {
  expectFileToMatchSnapshot(filePath);
}

/**
 * Helper function to test the REST CRUD Urls generated
 * @param {string} restUrl The base URL that should've been generated
 */
function checkRestPaths(restUrl) {
  assert.fileContent(
    filePath,
    new RegExp(/@post\('/.source + restUrl + /', {/.source),
  );
  assert.fileContent(
    filePath,
    new RegExp(/@get\('/.source + restUrl + /\/count', {/.source),
  );
  assert.fileContent(
    filePath,
    new RegExp(/@get\('/.source + restUrl + /', {/.source),
  );
  assert.fileContent(
    filePath,
    new RegExp(/@patch\('/.source + restUrl + /', {/.source),
  );
  assert.fileContent(
    filePath,
    new RegExp(/@get\('/.source + restUrl + /\/{id}', {/.source),
  );
  assert.fileContent(
    filePath,
    new RegExp(/@patch\('/.source + restUrl + /\/{id}', {/.source),
  );
  assert.fileContent(
    filePath,
    new RegExp(/@del\('/.source + restUrl + /\/{id}', {/.source),
  );
}
