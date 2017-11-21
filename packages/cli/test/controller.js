// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

const generator = path.join(__dirname, '../generators/controller');
const badProps = {
  name: 'foo#Bar',
  description: 'My controller for LoopBack 4',
};
const validProps = {
  name: 'fooBar',
  description: 'My controller for LoopBack 4',
};
const fileName = 'fooBar.controller.ts';
const tests = require('./artifact')(generator);

describe('generator-loopback4:controller', tests);

describe('lb4 controller', () => {
  describe('with bad prompts', () => {
    before(() => {
      return helpers.run(generator).withPrompts(badProps);
    });
    it('should not generate any files', () => {
      assert.noFile('foo#Bar.controller.ts');
    });
  });
  describe('with valid prompts', () => {
    before(() => {
      return helpers.run(generator).withPrompts(validProps);
    });
    it('writes correct file name', () => {
      assert.file(fileName);
    });
    it('scaffolds correctly', () => {
      assert.fileContent(fileName, 'class FooBarController');
      assert.fileContent(fileName, 'constructor() {}');
    });
  });
});
