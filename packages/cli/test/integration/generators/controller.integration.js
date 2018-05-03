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
  name: 'fooBar',
};
const withInputName = testUtils.givenAControllerPath(
  null,
  'foo-bar.controller.ts',
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
          .withArguments('fooBar');
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
      name: 'fooBar',
      controllerType: ControllerGenerator.REST,
    };
    it('creates REST CRUD template with valid input', () => {
      let tmpDir;
      return testUtils
        .runGeneratorWith(
          generator,
          Object.assign(
            {
              modelName: 'Foo',
              repositoryName: 'BarRepository',
              id: 'number',
            },
            baseInput,
          ),
          dir => {
            tmpDir = dir;
            testUtils.givenAnApplicationDir(tmpDir);
            fs.writeFileSync(
              testUtils.givenAModelPath(tmpDir, 'foo.model.ts'),
              '--DUMMY VALUE--',
            );
            fs.writeFileSync(
              testUtils.givenARepositoryPath(tmpDir, 'bar.repository.ts'),
              '--DUMMY VALUE--',
            );
          },
        )
        .then(() => {
          return checkRestCrudContents(tmpDir);
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
          modelName: 'Foo',
          id: 'number',
        },
        baseInput,
      ),
      dir => {
        testUtils.givenAnApplicationDir(dir);
        fs.writeFileSync(
          testUtils.givenAModelPath(dir, 'foo.model.ts'),
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
          modelName: 'Foo',
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
          modelName: 'Foo',
          repositoryName: 'BarRepository',
          id: 'number',
        },
        baseInput,
      ),
      dir => {
        testUtils.givenAnApplicationDir(dir, {omitRepositoryDir: true});
        fs.writeFileSync(
          testUtils.givenAModelPath(dir, 'foo.model.ts'),
          '--DUMMY VALUE--',
        );
      },
    );
  }

  function checkBasicContents(tmpDir) {
    assert.fileContent(tmpDir + withInputName, /class FooBarController/);
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
    assert.fileContent(tmpDir + withInputName, /class FooBarController/);

    // Repository and injection
    assert.fileContent(tmpDir + withInputName, /\@repository\(BarRepository\)/);
    assert.fileContent(
      tmpDir + withInputName,
      /barRepository \: BarRepository/,
    );

    // Assert that the decorators are present in the correct groupings!
    assert.fileContent(
      tmpDir + withInputName,
      /\@post\('\/foo'\)\s{1,}async create\(\@requestBody\(\)/,
    );

    assert.fileContent(
      tmpDir + withInputName,
      /\@get\('\/foo\/count'\)\s{1,}async count\(\@param.query.string\('where'\)/,
    );

    assert.fileContent(
      tmpDir + withInputName,
      /\@get\('\/foo'\)\s{1,}async find\(\@param.query.string\('filter'\)/,
    );
    assert.fileContent(
      tmpDir + withInputName,
      /\@patch\('\/foo'\)\s{1,}async updateAll\(\@param.query.string\('where'\) where: Where,\s{1,}\@requestBody\(\)/,
    );
    assert.fileContent(
      tmpDir + withInputName,
      /\@del\('\/foo'\)\s{1,}async deleteAll\(\@param.query.string\('where'\)/,
    );
    assert.fileContent(
      tmpDir + withInputName,
      /\@get\('\/foo\/{id}'\)\s{1,}async findById\(\@param.path.number\('id'\)/,
    );
    assert.fileContent(
      tmpDir + withInputName,
      /\@patch\('\/foo\/{id}'\)\s{1,}async updateById\(\@param.path.number\('id'\) id: number, \@requestBody\(\)/,
    );
    assert.fileContent(
      tmpDir + withInputName,
      /\@del\('\/foo\/{id}'\)\s{1,}async deleteById\(\@param.path.number\('id'\) id: number\)/,
    );
  }
});
