// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs-extra');

describe('build', function() {
  // eslint-disable-next-line no-invalid-this
  this.timeout(30000);
  const cwd = process.cwd();
  const projectDir = path.resolve(__dirname, './fixtures');

  function cleanup() {
    const run = require('../../bin/run-clean');
    run([
      'node',
      'bin/run-clean',
      'tsconfig.json',
      'tsconfig.build.json',
      '*.tsbuildinfo',
      'dist*',
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
    const run = require('../../bin/compile-package');
    const childProcess = run(['node', 'bin/compile-package']);
    childProcess.on('close', code => {
      assert.equal(code, 0);
      assert(
        fs.existsSync(path.join(projectDir, 'dist')),
        'dist should have been created',
      );
      assert(
        fs.existsSync(path.join(projectDir, 'tsconfig.json')),
        'tsconfig.json should have been created',
      );
      const tsConfig = fs.readJSONSync(path.join(projectDir, 'tsconfig.json'));
      assert.equal(tsConfig.extends, '../../../config/tsconfig.common.json');
      done();
    });
  });

  it('honors tsconfig.build.json over tsconfig.json', () => {
    fs.writeJSONSync('tsconfig.build.json', {
      extends: '../../../config/tsconfig.common.json',
      include: ['src', 'test'],
      exclude: ['node_modules/**', 'packages/*/node_modules/**', '**/*.d.ts'],
    });
    fs.writeJSONSync('tsconfig.json', {
      extends: '../../../config/tsconfig.common.json',
      include: ['src', 'test'],
      exclude: ['node_modules/**', 'packages/*/node_modules/**', '**/*.d.ts'],
    });
    const run = require('../../bin/compile-package');
    const command = run(['node', 'bin/compile-package'], true);
    assert(
      command.indexOf('-p tsconfig.build.json') !== -1,
      'project level tsconfig.build.json should be honored',
    );
  });

  it('honors tsconfig.json if tsconfig.build.json is not present', () => {
    fs.writeJSONSync('tsconfig.json', {
      extends: '../../../config/tsconfig.common.json',
      include: ['src', 'test'],
      exclude: ['node_modules/**', 'packages/*/node_modules/**', '**/*.d.ts'],
    });
    const run = require('../../bin/compile-package');
    const command = run(['node', 'bin/compile-package'], true);
    assert(
      command.indexOf('-p tsconfig.json') !== -1,
      'project level tsconfig.json should be honored',
    );
  });

  it('honors -p option for tsc', () => {
    const run = require('../../bin/compile-package');
    const command = run(
      ['node', 'bin/compile-package', '-p', 'tsconfig.my.json'],
      true,
    );
    assert(
      command.indexOf('-p tsconfig.my.json') !== -1,
      '-p should be honored',
    );
  });

  it('honors --project option for tsc', () => {
    const run = require('../../bin/compile-package');
    const command = run(
      ['node', 'bin/compile-package', '--project', 'tsconfig.my.json'],
      true,
    );
    assert(
      command.indexOf('--project tsconfig.my.json') !== -1,
      '--project should be honored',
    );
  });

  it('honors --target option for tsc', () => {
    const run = require('../../bin/compile-package');
    const command = run(
      ['node', 'bin/compile-package', '--target', 'es2015'],
      true,
    );
    assert(
      command.indexOf('--target es2015') !== -1,
      '--target should be honored (actual command: ' + command + ')',
    );
  });

  it('honors --outDir option for tsc', () => {
    const run = require('../../bin/compile-package');
    const command = run(
      ['node', 'bin/compile-package', '--outDir', './dist'],
      true,
    );
    assert(
      command.indexOf('--outDir dist') !== -1,
      '--outDir should be honored',
    );
  });

  it('runs prettier against ts files', done => {
    const run = require('../../bin/run-prettier');
    const childProcess = run(
      ['node', 'bin/run-prettier', '**/src/*.ts', '--', '-l'],
      {
        stdio: [process.stdin, 'ignore', process.stderr],
      },
    );
    childProcess.on('close', code => {
      assert.equal(code, 0);
      done();
    });
  });

  it('removes directories/files', () => {
    const run = require('../../bin/run-clean');
    const command = run(
      ['node', 'bin/run-clean', 'tsconfig.json', 'dist'],
      true,
    );
    assert(command.indexOf('tsconfig.json dist') !== -1);
  });

  it('does not remove directories/files outside the project', () => {
    const run = require('../../bin/run-clean');
    const command = run(
      [
        'node',
        'bin/run-clean',
        '../tsconfig.json',
        './dist',
        path.join(process.cwd(), '../../api-docs'),
      ],
      true,
    );
    assert(command.indexOf('rm -rf ./dist') !== -1);
  });

  describe('with LERNA_ROOT_PATH', () => {
    const repoRoot = path.join(__dirname, '../../../..');
    before(() => (process.env.LERNA_ROOT_PATH = repoRoot));

    it('sets --project option for tsc', () => {
      const run = require('../../bin/compile-package');
      const command = run(['node', 'bin/compile-package'], true);
      const tsConfig = path.relative(
        repoRoot,
        path.join(__dirname, './fixtures/tsconfig.json'),
      );
      assert(
        command.indexOf(`-p ${tsConfig}`) !== -1,
        '-p should be set relative to the monorepo root',
      );
    });

    after(() => delete process.env.LERNA_ROOT_PATH);
  });
});

describe('mocha', function() {
  // eslint-disable-next-line no-invalid-this
  this.timeout(30000);
  const cwd = process.cwd();
  const projectDir = path.resolve(__dirname, './fixtures');

  function cleanup() {
    const run = require('../../bin/run-clean');
    run(['node', 'bin/run-clean', '.mocharc.json']);
  }

  beforeEach(() => {
    process.chdir(projectDir);
    cleanup();
  });

  afterEach(() => {
    cleanup();
    process.chdir(cwd);
  });

  it('loads built-in .mocharc.json file', () => {
    const run = require('../../bin/run-mocha');
    const command = run(['node', 'bin/run-mocha', '"dist/__tests__"'], true);
    const builtInMochaOptsFile = path.join(
      __dirname,
      '../../config/.mocharc.json',
    );
    assert(
      command.indexOf(builtInMochaOptsFile) !== -1,
      '--config should be set by default',
    );
  });

  it('honors --config option', () => {
    const run = require('../../bin/run-mocha');
    const command = run(
      [
        'node',
        'bin/run-mocha',
        '--config custom/.mocharc.json',
        '"dist/__tests__"',
      ],
      true,
    );
    assert(
      command.indexOf('--config custom/.mocharc.json') !== -1,
      '--config custom/.mocharc.json should be honored',
    );
  });

  it('loads .mocharc.json specific project file', () => {
    const run = require('../../bin/run-mocha');
    const buitInMochaOptsPath = path.join(
      __dirname,
      '../../config/.mocharc.json',
    );
    const destPath = path.join(__dirname, './fixtures/.mocharc.json');

    fs.copyFileSync(buitInMochaOptsPath, destPath);

    const command = run(['node', 'bin/run-mocha', '"dist/__tests__"'], true);
    assert(
      command.indexOf('--config') === -1,
      'should skip built-in .mocharc.json file when specific project file exist',
    );
  });
});
