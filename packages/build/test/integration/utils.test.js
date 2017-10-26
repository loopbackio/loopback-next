// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const utils = require('../../bin/utils');

describe('utils', () => {
  it('compiles ts files', (done) => {
    var projectDir = path.resolve(__dirname, '../fixtures');
    process.chdir(projectDir);
    try {
      fs.unlinkSync(path.join(projectDir, 'tsconfig.build.json'));
    } catch (e) {
      // Ignore it
    }
    var run = require('../../bin/compile-package');
    var childProcess = run(['node', 'bin/compile-package']);
    childProcess.on('close', code => {
      assert.equal(code, 0);
      assert(fs.existsSync(path.join(projectDir, 'dist')));
      assert(fs.existsSync(path.join(projectDir, 'tsconfig.build.json')));
      done();
    });
  });

  it('runs tslint against ts files', (done) => {
    var projectDir = path.resolve(__dirname, '../fixtures');
    process.chdir(projectDir);
    var run = require('../../bin/run-tslint');
    var childProcess = run(['node', 'bin/run-tslint']);
    childProcess.on('close', code => {
      assert.equal(code, 0);
      done();
    });
  });

  it('runs prettier against ts files', (done) => {
    var projectDir = path.resolve(__dirname, '../fixtures');
    process.chdir(projectDir);
    var run = require('../../bin/run-prettier');
    var childProcess = run([
      'node',
      'bin/run-prettier',
      '**/src/*.ts',
      '--',
      '-l',
    ]);
    childProcess.on('close', code => {
      assert.equal(code, 0);
      done();
    });
  });
});
