// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs-extra');

describe('build', () => {
  var cwd = process.cwd();
  var projectDir = path.resolve(__dirname, '../fixtures');

  function cleanup() {
    var run = require('../../bin/run-clean');
    run([
      'node',
      'bin/run-clean',
      'tsconfig.json',
      'tsconfig.build.json',
      'dist',
      'api-docs',
    ]);
  }

  beforeEach(() => {
    process.chdir(projectDir);
    cleanup();
  });

  afterEach(() => {
    cleanup();
    process.chdir(cwd);
  });

  it('compiles ts files', done => {
    var run = require('../../bin/compile-package');
    var childProcess = run(['node', 'bin/compile-package']);
    childProcess.on('close', code => {
      assert.equal(code, 0);
      assert(
        fs.existsSync(path.join(projectDir, 'dist')),
        'dist should have been created'
      );
      assert(
        fs.existsSync(path.join(projectDir, 'tsconfig.json')),
        'tsconfig.json should have been created'
      );
      var tsConfig = fs.readJSONSync(path.join(projectDir, 'tsconfig.json'));
      assert.equal(tsConfig.extends, '../../config/tsconfig.common.json');
      done();
    });
  });

  it('honors tsconfig.build.json over tsconfig.json', () => {
    fs.writeJSONSync('tsconfig.build.json', {
      extends: '../../config/tsconfig.common.json',
      include: ['src', 'test'],
      exclude: ['node_modules/**', 'packages/*/node_modules/**', '**/*.d.ts'],
    });
    fs.writeJSONSync('tsconfig.json', {
      extends: '../../config/tsconfig.common.json',
      include: ['src', 'test'],
      exclude: ['node_modules/**', 'packages/*/node_modules/**', '**/*.d.ts'],
    });
    var run = require('../../bin/compile-package');
    var command = run(['node', 'bin/compile-package'], true);
    assert(
      command.indexOf('-p ' + path.join(projectDir, 'tsconfig.build.json')) !==
        -1,
      'project level tsconfig.build.json should be honored'
    );
  });

  it('honors tsconfig.json if tsconfig.build.json is not present', () => {
    fs.writeJSONSync('tsconfig.json', {
      extends: '../../config/tsconfig.common.json',
      include: ['src', 'test'],
      exclude: ['node_modules/**', 'packages/*/node_modules/**', '**/*.d.ts'],
    });
    var run = require('../../bin/compile-package');
    var command = run(['node', 'bin/compile-package'], true);
    assert(
      command.indexOf('-p ' + path.join(projectDir, 'tsconfig.json')) !== -1,
      'project level tsconfig.json should be honored'
    );
  });

  it('honors -p option for tsc', () => {
    var run = require('../../bin/compile-package');
    var command = run(
      ['node', 'bin/compile-package', '-p', 'tsconfig.my.json'],
      true
    );
    assert(
      command.indexOf('-p tsconfig.my.json') !== -1,
      '-p should be honored'
    );
  });

  it('honors --project option for tsc', () => {
    var run = require('../../bin/compile-package');
    var command = run(
      ['node', 'bin/compile-package', '--project', 'tsconfig.my.json'],
      true
    );
    assert(
      command.indexOf('--project tsconfig.my.json') !== -1,
      '--project should be honored'
    );
  });

  it('honors --target option for tsc', () => {
    var run = require('../../bin/compile-package');
    var command = run(
      ['node', 'bin/compile-package', '--target', 'es2015'],
      true
    );
    assert(
      command.indexOf('--target es2015') !== -1,
      '--target should be honored'
    );
  });

  it('honors no-option as target for tsc', () => {
    var run = require('../../bin/compile-package');
    var command = run(['node', 'bin/compile-package', 'es2015'], true);
    assert(
      command.indexOf('--target es2015') !== -1,
      '--target should be honored'
    );
  });

  it('honors no-option as target with -p for tsc', () => {
    var run = require('../../bin/compile-package');
    var command = run(
      ['node', 'bin/compile-package', 'es2015', '-p', 'tsconfig.my.json'],
      true
    );
    assert(
      command.indexOf('--target es2015') !== -1,
      '--target should be honored'
    );
    assert(
      command.indexOf('-p tsconfig.my.json') !== -1,
      '-p should be honored'
    );
  });

  it('honors --outDir option for tsc', () => {
    var run = require('../../bin/compile-package');
    var command = run(
      ['node', 'bin/compile-package', '--outDir', './dist'],
      true
    );
    assert(
      command.indexOf('--outDir ./dist') !== -1,
      '--outDir should be honored'
    );
  });

  it('generates apidocs', done => {
    var run = require('../../bin/generate-apidocs');
    var childProcess = run(['node', 'bin/generate-apidocs']);
    childProcess.on('close', code => {
      assert.equal(code, 0);
      assert(
        fs.existsSync(path.join(projectDir, 'api-docs')),
        'api-docs should have been created'
      );
      done();
    });
  });

  it('runs tslint against ts files', done => {
    var run = require('../../bin/run-tslint');
    var childProcess = run(['node', 'bin/run-tslint']);
    childProcess.on('close', code => {
      assert.equal(code, 0);
      done();
    });
  });

  it('honors -c option for tslint', () => {
    var run = require('../../bin/run-tslint');
    var command = run(['node', 'bin/un-tslint', '-c', 'tslint.my.json'], true);
    assert(command.indexOf('-c tslint.my.json') !== -1, '-c should be honored');
  });

  it('honors --config option for tslint', () => {
    var run = require('../../bin/run-tslint');
    var command = run(
      ['node', 'bin/un-tslint', '--config', 'tslint.my.json'],
      true
    );
    assert(
      command.indexOf('--config tslint.my.json') !== -1,
      '--config should be honored'
    );
  });

  it('honors -p option for tslint', () => {
    var run = require('../../bin/run-tslint');
    var command = run(['node', 'bin/un-tslint', '-p', 'tsonfig.my.json'], true);
    assert(command.indexOf('-p tsonfig') !== -1, '-p should be honored');
  });

  it('honors --project option for tslint', () => {
    var run = require('../../bin/run-tslint');
    var command = run(
      ['node', 'bin/un-tslint', '--project', 'tsonfig.my.json'],
      true
    );
    assert(
      command.indexOf('--project tsonfig') !== -1,
      '--project should be honored'
    );
  });

  it('runs prettier against ts files', done => {
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

  it('removes directories/files', () => {
    var run = require('../../bin/run-clean');
    var command = run(
      ['node', 'bin/run-clean', 'tsconfig.json', 'dist', 'api-docs'],
      true
    );
    assert(command.indexOf('tsconfig.json dist api-docs') !== -1);
  });

  it('does not remove directories/files outside the project', () => {
    var run = require('../../bin/run-clean');
    var command = run(
      [
        'node',
        'bin/run-clean',
        '../tsconfig.json',
        './dist',
        path.join(process.cwd(), '../../api-docs'),
      ],
      true
    );
    assert(command.indexOf('rm -rf ./dist') !== -1);
  });
});
