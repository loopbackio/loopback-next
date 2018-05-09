// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const expect = require('@loopback/testlab').expect;
const debug = require('../../../lib/debug')('controller-test');
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fs = require('fs');
const util = require('util');
const utils = require('../../../lib/utils');
const testUtils = require('../../test-utils');

const ControllerGenerator = require('../../../generators/controller');
const generator = path.join(__dirname, '../../../generators/controller');
const tests = require('../lib/artifact-generator')(generator);
const baseTests = require('../lib/base-generator')(generator);

const templateName = testUtils.givenAControllerPath(
  null,
  'controller-template.ts',
);
const withInputProps = {
  name: 'productReview',
};
const withInputName = testUtils.givenAControllerPath(
  null,
  'product-review.controller.ts',
);

describe('controller-generator extending BaseGenerator', baseTests);
describe('generator-loopback4:controller', tests);

describe('lb4 controller', () => {
  it('does not run without package.json', () => {
    return testUtils
      .runGeneratorWith(
        generator,
        withInputProps,
        testUtils.givenAnApplicationDir,
      )
      .then(() => {
        assert.noFile(withInputName);
      });
  });

  it('does not run without the loopback keyword', () => {
    return testUtils
      .runGeneratorWith(
        generator,
        withInputProps,
        testUtils.givenAnApplicationDir,
      )
      .then(() => {
        assert.noFile(withInputName);
      });
  });

  describe('basic', () => {
    describe('with input', () => {
      let tmpDir;
      before(() => {
        return testUtils
          .runGeneratorWith(generator, withInputProps, dir => {
            tmpDir = dir;
            testUtils.givenAnApplicationDir(dir);
          })
          .toPromise();
      });

      it('writes correct file name', () => {
        assert.file(tmpDir + withInputName);
        assert.noFile(tmpDir + templateName);
      });

      it('scaffolds correct files', () => {
        checkBasicContents(tmpDir);
      });
    });
    describe('with arg', () => {
      let tmpDir;
      before(() => {
        return testUtils
          .runGeneratorWith(generator, null, dir => {
            tmpDir = dir;
            testUtils.givenAnApplicationDir(dir);
          })
          .withArguments('productReview');
      });

      it('writes correct file name', () => {
        assert.file(tmpDir + withInputName);
        assert.noFile(tmpDir + templateName);
      });

      it('scaffolds correct files', () => {
        checkBasicContents(tmpDir);
      });
    });
  });

  describe('REST CRUD', () => {
    const baseInput = {
      name: 'productReview',
      controllerType: ControllerGenerator.REST,
    };

    it('creates REST CRUD template with valid input', () => {
      let tmpDir;
      return testUtils
        .runGeneratorWith(
          generator,
          Object.assign(
            {
              modelName: 'ProductReview',
              repositoryName: 'BarRepository',
              id: 'number',
            },
            baseInput,
          ),
          dir => {
            tmpDir = dir;
            givenModelAndRepository(tmpDir);
          },
        )
        .then(() => {
          return checkRestCrudContents(tmpDir);
        });
    });

    describe('HTTP REST path', () => {
      it('defaults correctly', () => {
        let tmpDir;
        return testUtils
          .runGeneratorWith(
            generator,
            Object.assign(
              {
                modelName: 'ProductReview',
                repositoryName: 'BarRepository',
                id: 'number',
              },
              baseInput,
            ),
            dir => {
              tmpDir = dir;
              givenModelAndRepository(tmpDir);
            },
          )
          .then(() => {
            checkRestPaths(tmpDir, '/product-reviews');
          });
      });

      it('honors custom http PATHs', () => {
        let tmpDir;
        return testUtils
          .runGeneratorWith(
            generator,
            Object.assign(
              {
                modelName: 'ProductReview',
                repositoryName: 'BarRepository',
                id: 'number',
                httpPathName: '/customer-orders',
              },
              baseInput,
            ),
            dir => {
              tmpDir = dir;
              givenModelAndRepository(tmpDir);
            },
          )
          .then(() => {
            checkRestPaths(tmpDir, '/customer-orders');
          });
      });
    });

    it('fails when no model is given', () => {
      return noModelGiven(baseInput).catch(err => {
        expect(err.message).to.match(/No models found in /);
      });
    });

    it('fails when no repository is given', () => {
      return noRepositoryGiven(baseInput).catch(err => {
        expect(err.message).to.match(/No repositories found in /);
      });
    });

    it('fails when no model directory present', () => {
      return noModelFolder(baseInput).catch(err => {
        expect(err.message).to.match(
          /ENOENT: no such file or directory, scandir(.*?)models\b/,
        );
      });
    });

    it('fails when no repository directory present', () => {
      return noRepositoryFolder(baseInput).catch(err => {
        expect(err.message).to.match(
          /ENOENT: no such file or directory, scandir(.*?)repositories\b/,
        );
      });
    });
  });

  /**
   * Helper function for setting model and repository input
   * @param {string} tmpDir The temporary directory to set up model & repository
   */
  function givenModelAndRepository(tmpDir) {
    testUtils.givenAnApplicationDir(tmpDir);
    fs.writeFileSync(
      testUtils.givenAModelPath(tmpDir, 'product-review.model.ts'),
      '--DUMMY VALUE--',
    );
    fs.writeFileSync(
      testUtils.givenARepositoryPath(tmpDir, 'bar.repository.ts'),
      '--DUMMY VALUE--',
    );
  }

  /**
   * Helper function for testing behaviour without model input.
   * @param {object} baseInput The base input for the controller type.
   */
  function noModelGiven(baseInput) {
    let tmpDir;
    return testUtils.runGeneratorWith(
      generator,
      Object.assign(
        {
          repositoryName: 'BarRepository',
          id: 'number',
        },
        baseInput,
      ),
      dir => {
        testUtils.givenAnApplicationDir(dir);
        fs.writeFileSync(
          testUtils.givenARepositoryPath(dir, 'bar.repository.ts'),
          '--DUMMY VALUE--',
        );
      },
    );
  }
  /**
   * Helper function for testing behaviour without repository input.
   * @param {object} baseInput The base input for the controller type.
   */
  function noRepositoryGiven(baseInput) {
    let tmpDir;
    return testUtils.runGeneratorWith(
      generator,
      Object.assign(
        {
          modelName: 'ProductReview',
          id: 'number',
        },
        baseInput,
      ),
      dir => {
        testUtils.givenAnApplicationDir(dir);
        fs.writeFileSync(
          testUtils.givenAModelPath(dir, 'product-review.model.ts'),
          '--DUMMY VALUE--',
        );
      },
    );
  }

  /**
   * Helper function for testing behaviour without a model folder.
   * @param {object} baseInput The base input for the controller type.
   */
  function noModelFolder(baseInput) {
    let tmpDir;
    return testUtils.runGeneratorWith(
      generator,
      Object.assign(
        {
          modelName: 'ProductReview',
          repositoryName: 'BarRepository',
          id: 'number',
        },
        baseInput,
      ),
      dir => {
        testUtils.givenAnApplicationDir(dir, {omitModelDir: true});
        fs.writeFileSync(
          testUtils.givenARepositoryPath(dir, 'bar.repository.ts'),
          '--DUMMY VALUE--',
        );
      },
    );
  }

  /**
   * Helper function for testing behaviour without a repository folder.
   * @param {object} baseInput The base input for the controller type.
   */
  function noRepositoryFolder(baseInput) {
    let tmpDir;
    return testUtils.runGeneratorWith(
      generator,
      Object.assign(
        {
          modelName: 'ProductReview',
          repositoryName: 'BarRepository',
          id: 'number',
        },
        baseInput,
      ),
      dir => {
        testUtils.givenAnApplicationDir(dir, {omitRepositoryDir: true});
        fs.writeFileSync(
          testUtils.givenAModelPath(dir, 'product-review.model.ts'),
          '--DUMMY VALUE--',
        );
      },
    );
  }

  function checkBasicContents(tmpDir) {
    assert.fileContent(tmpDir + withInputName, /class ProductReviewController/);
    assert.fileContent(tmpDir + withInputName, /constructor\(\) {}/);
  }

  /**
   * Assertions against the template to determine if it contains the
   * required signatures for a REST CRUD controller, specifically to ensure
   * that decorators are grouped correctly (for their corresponding
   * target functions)
   *
   * This function calls checkCrudContents.
   * @param {String} tmpDir
   */
  function checkRestCrudContents(tmpDir) {
    assert.fileContent(tmpDir + withInputName, /class ProductReviewController/);

    // Repository and injection
    assert.fileContent(tmpDir + withInputName, /\@repository\(BarRepository\)/);
    assert.fileContent(
      tmpDir + withInputName,
      /barRepository \: BarRepository/,
    );

    // Assert that the decorators are present in the correct groupings!
    assert.fileContent(
      tmpDir + withInputName,
      /\@post\('\/product-reviews'\)\s{1,}async create\(\@requestBody\(\)/,
    );

    assert.fileContent(
      tmpDir + withInputName,
      /\@get\('\/product-reviews\/count'\)\s{1,}async count\(\@param.query.string\('where'\)/,
    );

    assert.fileContent(
      tmpDir + withInputName,
      /\@get\('\/product-reviews'\)\s{1,}async find\(\@param.query.string\('filter'\)/,
    );
    assert.fileContent(
      tmpDir + withInputName,
      /\@patch\('\/product-reviews'\)\s{1,}async updateAll\(\s{1,}\@param.query.string\('where'\) where: Where,\s{1,}\@requestBody\(\)/,
    );
    assert.fileContent(
      tmpDir + withInputName,
      /\@del\('\/product-reviews'\)\s{1,}async deleteAll\(\@param.query.string\('where'\)/,
    );
    assert.fileContent(
      tmpDir + withInputName,
      /\@get\('\/product-reviews\/{id}'\)\s{1,}async findById\(\@param.path.number\('id'\)/,
    );
    assert.fileContent(
      tmpDir + withInputName,
      /\@patch\('\/product-reviews\/{id}'\)\s{1,}async updateById\(\s{1,}\@param.path.number\('id'\) id: number,\s{1,}\@requestBody\(\)/,
    );
    assert.fileContent(
      tmpDir + withInputName,
      /\@del\('\/product-reviews\/{id}'\)\s{1,}async deleteById\(\@param.path.number\('id'\) id: number\)/,
    );
  }

  function checkRestPaths(tmpDir, restUrl) {
    assert.fileContent(
      tmpDir + withInputName,
      new RegExp(/@post\('/.source + restUrl + /'\)/.source),
    );
    assert.fileContent(
      tmpDir + withInputName,
      new RegExp(/@get\('/.source + restUrl + /\/count'\)/.source),
    );
    assert.fileContent(
      tmpDir + withInputName,
      new RegExp(/@get\('/.source + restUrl + /'\)/.source),
    );
    assert.fileContent(
      tmpDir + withInputName,
      new RegExp(/@patch\('/.source + restUrl + /'\)/.source),
    );
    assert.fileContent(
      tmpDir + withInputName,
      new RegExp(/@del\('/.source + restUrl + /'\)/.source),
    );
    assert.fileContent(
      tmpDir + withInputName,
      new RegExp(/@get\('/.source + restUrl + /\/{id}'\)/.source),
    );
    assert.fileContent(
      tmpDir + withInputName,
      new RegExp(/@patch\('/.source + restUrl + /\/{id}'\)/.source),
    );
    assert.fileContent(
      tmpDir + withInputName,
      new RegExp(/@del\('/.source + restUrl + /\/{id}'\)/.source),
    );
  }
});
