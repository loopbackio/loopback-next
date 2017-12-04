// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fs = require('fs');

const generator = path.join(__dirname, '../generators/controller');
const tests = require('./artifact')(generator);
const baseTests = require('./base-generator')(generator);

const templateName = '/src/controllers/controller-template.ts';
const withInputProps = {
  name: 'fooBar',
};
const withInputName = '/src/controllers/foo-bar.controller.ts';

describe('controller-generator extending BaseGenerator', baseTests);
describe('generator-loopback4:controller', tests);

describe('lb4 controller', () => {
  it('does not run without package.json', () => {
    helpers
      .run(generator)
      .withPrompts(withInputProps)
      .then(() => {
        assert.noFile(withInputName);
      });
  });
  it('does not run without the loopback keyword', () => {
    let tmpDir;
    helpers
      .run(generator)
      .inTmpDir(dir => {
        tmpDir = dir;
        fs.writeFileSync(
          path.join(tmpDir, 'package.json'),
          JSON.stringify({
            keywords: ['foobar'],
          })
        );
      })
      .withPrompts(withInputProps)
      .then(() => {
        assert.noFile(withInputName);
      });
  });

  describe('with input', () => {
    let tmpDir;
    before(() => {
      return helpers
        .run(generator)
        .inTmpDir(dir => {
          tmpDir = dir;
          fs.writeFileSync(
            path.join(tmpDir, 'package.json'),
            JSON.stringify({
              keywords: ['loopback'],
            })
          );
        })
        .withPrompts(withInputProps);
    });
    it('writes correct file name', () => {
      assert.file(tmpDir + withInputName);
      assert.noFile(tmpDir + templateName);
    });
    it('scaffolds correct files', () => {
      assert.fileContent(tmpDir + withInputName, /class FooBarController/);
      assert.fileContent(tmpDir + withInputName, /constructor\(\) {}/);
    });
  });
  describe('with arg', () => {
    let tmpDir;
    before(() => {
      return helpers
        .run(generator)
        .inTmpDir(dir => {
          tmpDir = dir;
          fs.writeFileSync(
            path.join(tmpDir, 'package.json'),
            JSON.stringify({
              keywords: ['loopback'],
            })
          );
        })
        .withArguments('fooBar');
    });
    it('writes correct file name', () => {
      assert.file(tmpDir + withInputName);
      assert.noFile(tmpDir + templateName);
    });
    it('scaffolds correct files', () => {
      assert.fileContent(tmpDir + withInputName, /class FooBarController/);
      assert.fileContent(tmpDir + withInputName, /constructor\(\) {}/);
    });
  });
});
