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
  id: 'number',
};

// Expected File Name
const expectedFile = path.join(
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

  it('does not run without the loopback keyword', () => {
    return expect(
      testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {excludeKeyword: true}),
        )
        .withPrompts(basicCLIInput),
    ).to.be.rejectedWith(/No `loopback` keyword found in/);
  });

  describe('basic controller', () => {
    it('scaffolds correct file with input', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH))
        .withPrompts(basicCLIInput);

      assert.file(expectedFile);
      checkBasicContents();
    });

    it('scaffolds correct file with args', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH))
        .withArguments('productReview');

      assert.file(expectedFile);
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

    it('creates REST CRUD template with valid input', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            includeDummyModel: true,
            includeDummyRepository: true,
          }),
        )
        .withPrompts(restCLIInputComplete);

      checkRestCrudContents();
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
  assert.fileContent(expectedFile, /class ProductReviewController/);
  assert.fileContent(expectedFile, /constructor\(\) {}/);
}

/**
 * Assertions against the template to determine if it contains the
 * required signatures for a REST CRUD controller, specifically to ensure
 * that decorators are grouped correctly (for their corresponding
 * target functions)
 */
function checkRestCrudContents() {
  assert.fileContent(expectedFile, /class ProductReviewController/);

  // Repository and injection
  assert.fileContent(expectedFile, /\@repository\(BarRepository\)/);
  assert.fileContent(expectedFile, /barRepository \: BarRepository/);

  // Assert that the decorators are present in the correct groupings!
  // @post - create
  const postCreateRegEx = [
    /\@post\('\/product-reviews', {/,
    /responses: {/,
    /'200': {/,
    /description: 'ProductReview model instance'/,
    /content: {'application\/json': {'x-ts-type': ProductReview}},\s{1,}},\s{1,}},\s{1,}}\)/,
    /async create\(\@requestBody\(\)/,
  ];
  postCreateRegEx.forEach(regex => {
    assert.fileContent(expectedFile, regex);
  });

  // @get - count
  const getCountRegEx = [
    /\@get\('\/product-reviews\/count', {/,
    /responses: {/,
    /'200': {/,
    /description: 'ProductReview model count'/,
    /content: {'application\/json': {'x-ts-type': Number}},\s{1,}},\s{1,}},\s{1,}}\)/,
    /async count\(\@param.query.string\('where'\)/,
  ];
  getCountRegEx.forEach(regex => {
    assert.fileContent(expectedFile, regex);
  });

  // @get - find
  const getFindRegEx = [
    /\@get\('\/product-reviews', {/,
    /responses: {/,
    /'200': {/,
    /description: 'Array of ProductReview model instances'/,
    /content: {'application\/json': {'x-ts-type': ProductReview}},\s{1,}},\s{1,}},\s{1,}}\)/,
    /async find\(\@param.query.string\('filter'\)/,
  ];
  getFindRegEx.forEach(regex => {
    assert.fileContent(expectedFile, regex);
  });

  // @patch - updateAll
  const patchUpdateAllRegEx = [
    /\@patch\('\/product-reviews', {/,
    /responses: {/,
    /'200': {/,
    /description: 'ProductReview PATCH success count'/,
    /content: {'application\/json': {'x-ts-type': Number}},\s{1,}},\s{1,}},\s{1,}}\)/,
    /async updateAll\(\s{1,}\@requestBody\(\).*,\s{1,}\@param.query.string\('where'\) where\?: Where/,
  ];
  patchUpdateAllRegEx.forEach(regex => {
    assert.fileContent(expectedFile, regex);
  });

  // @get - findById
  const getFindByIdRegEx = [
    /\@get\('\/product-reviews\/{id}', {/,
    /responses: {/,
    /'200': {/,
    /description: 'ProductReview model instance'/,
    /content: {'application\/json': {'x-ts-type': ProductReview}},\s{1,}},\s{1,}},\s{1,}}\)/,
    /async findById\(\@param.path.number\('id'\)/,
  ];
  getFindByIdRegEx.forEach(regex => {
    assert.fileContent(expectedFile, regex);
  });

  // @patch - updateById
  const patchUpdateByIdRegEx = [
    /\@patch\('\/product-reviews\/{id}'/,
    /responses: {/,
    /'200': {/,
    /description: 'ProductReview PATCH success'/,
    /content: {'application\/json': {'x-ts-type': Boolean}},\s{1,}},\s{1,}},\s{1,}}\)/,
    /async updateById\(\s{1,}\@param.path.number\('id'\) id: number,\s{1,}\@requestBody\(\)/,
  ];
  patchUpdateByIdRegEx.forEach(regex => {
    assert.fileContent(expectedFile, regex);
  });

  // @del - deleteById
  const deleteByIdRegEx = [
    /\@del\('\/product-reviews\/{id}', {/,
    /responses: {/,
    /'200': {/,
    /description: 'ProductReview DELETE success'/,
    /content: {'application\/json': {'x-ts-type': Boolean}},\s{1,}},\s{1,}},\s{1,}}\)/,
    /async deleteById\(\@param.path.number\('id'\) id: number\)/,
  ];
  deleteByIdRegEx.forEach(regex => {
    assert.fileContent(expectedFile, regex);
  });
}

/**
 * Helper function to test the REST CRUD Urls generated
 * @param {string} restUrl The base URL that should've been generated
 */
function checkRestPaths(restUrl) {
  assert.fileContent(
    expectedFile,
    new RegExp(/@post\('/.source + restUrl + /', {/.source),
  );
  assert.fileContent(
    expectedFile,
    new RegExp(/@get\('/.source + restUrl + /\/count', {/.source),
  );
  assert.fileContent(
    expectedFile,
    new RegExp(/@get\('/.source + restUrl + /', {/.source),
  );
  assert.fileContent(
    expectedFile,
    new RegExp(/@patch\('/.source + restUrl + /', {/.source),
  );
  assert.fileContent(
    expectedFile,
    new RegExp(/@get\('/.source + restUrl + /\/{id}', {/.source),
  );
  assert.fileContent(
    expectedFile,
    new RegExp(/@patch\('/.source + restUrl + /\/{id}', {/.source),
  );
  assert.fileContent(
    expectedFile,
    new RegExp(/@del\('/.source + restUrl + /\/{id}', {/.source),
  );
}
