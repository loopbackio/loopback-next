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
const validProps = {
  name: 'fooBar',
  description: 'My controller for LoopBack 4',
};
const fileName = '/src/controllers/foo-bar.controller.ts';
const tests = require('./artifact')(generator);

describe('generator-loopback4:controller', tests);

describe('lb4 controller', () => {
  let tmpDir;
  before(() => {
    return helpers
      .run(generator)
      .inTmpDir(dir => {
        tmpDir = dir;
        fs.writeFileSync(
          path.join(tmpDir, 'package.json'),
          JSON.stringify({
            keywords: ['loopback-application'],
          })
        );
        tmpDir = path.join(dir, fileName);
      })
      .withPrompts(validProps);
  });
  it('writes correct file name', () => {
    assert.file(tmpDir);
  });
  it('scaffolds correct files', () => {
    assert.fileContent(tmpDir, /class FooBarController/);
    assert.fileContent(tmpDir, /constructor\(\) {}/);
  });
});
