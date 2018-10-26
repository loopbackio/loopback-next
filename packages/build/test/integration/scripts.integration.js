// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs-extra');

describe('build', function() {
  this.timeout(30000);
  var cwd = process.cwd();
  var projectDir = path.resolve(__dirname, './fixtures');

  function cleanup() {
    var run = require('../../bin/run-clean');
    run([
      'node',
      'bin/run-clean',
      'tsconfig.json',
      'tsconfig.build.json',
      'dist*',
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
    var childProcess = run(['node', 'bin/compile-package', 'es2015']);
    childProcess.on('close', code => {
      assert.equal(code, 0);
      assert(
        fs.existsSync(path.join(projectDir, 'dist6')),
        'dist6 should have been created',
      );
      assert(
        fs.existsSync(path.join(projectDir, 'tsconfig.json')),
        'tsconfig.json should have been created',
      );
      var tsConfig = fs.readJSONSync(path.join(projectDir, 'tsconfig.json'));
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
    var run = require('../../bin/compile-package');
    var command = run(['node', 'bin/compile-package'], true);
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
    var run = require('../../bin/compile-package');
    var command = run(['node', 'bin/compile-package'], true);
    assert(
      command.indexOf('-p tsconfig.json') !== -1,
      'project level tsconfig.json should be honored',
    );
  });

  it('honors -p option for tsc', () => {
    var run = require('../../bin/compile-package');
    var command = run(
      ['node', 'bin/compile-package', '-p', 'tsconfig.my.json'],
      true,
    );
    assert(
      command.indexOf('-p tsconfig.my.json') !== -1,
      '-p should be honored',
    );
  });

  it('honors --project option for tsc', () => {
    var run = require('../../bin/compile-package');
    var command = run(
      ['node', 'bin/compile-package', '--project', 'tsconfig.my.json'],
      true,
    );
    assert(
      command.indexOf('--project tsconfig.my.json') !== -1,
      '--project should be honored',
    );
  });

  it('honors --target option for tsc', () => {
    var run = require('../../bin/compile-package');
    var command = run(
      ['node', 'bin/compile-package', '--target', 'es2015'],
      true,
    );
    assert(
      command.indexOf('--target es2015') !== -1,
      '--target should be honored',
    );
  });

  it('honors no-option as target for tsc', () => {
    var run = require('../../bin/compile-package');
    var command = run(['node', 'bin/compile-package', 'es2015'], true);
    assert(
      command.indexOf('--target es2015') !== -1,
      '--target should be honored',
    );
  });

  it('honors no-option as target with -p for tsc', () => {
    var run = require('../../bin/compile-package');
    var command = run(
      ['node', 'bin/compile-package', 'es2015', '-p', 'tsconfig.my.json'],
      true,
    );
    assert(
      command.indexOf('--target es2015') !== -1,
      '--target should be honored',
    );
    assert(
      command.indexOf('-p tsconfig.my.json') !== -1,
      '-p should be honored',
    );
  });

  it('honors --outDir option for tsc', () => {
    var run = require('../../bin/compile-package');
    var command = run(
      ['node', 'bin/compile-package', '--outDir', './dist'],
      true,
    );
    assert(
      command.indexOf('--outDir dist') !== -1,
      '--outDir should be honored',
    );
  });

  it('generates apidocs', done => {
    var run = require('../../bin/generate-apidocs');
    var childProcess = run(['node', 'bin/generate-apidocs'], {
      stdio: [process.stdin, 'ignore', process.stderr],
    });
    childProcess.on('close', code => {
      assert.equal(code, 0);
      assert(
        fs.existsSync(path.join(projectDir, 'api-docs')),
        'api-docs should have been created',
      );
      var typedocDir = require.resolve('typedoc/package.json');
      typedocDir = path.resolve(typedocDir, '..');
      assert(
        !fs.existsSync(path.join(typedocDir, './node_modules/typescript')),
        'typedoc local dependency of typescript should have been renamed',
      );
      assert(
        !fs.existsSync(
          path.join(typedocDir, './node_modules/.bin/tsc'),
          'typedoc local scripts from typescript should have been removed',
        ),
      );
      done();
    });
  });

  it('honors --tsconfig for apidocs', () => {
    var run = require('../../bin/generate-apidocs');
    var command = run(
      ['node', 'bin/generate-apidocs', '--tsconfig', 'tsconfig.my.json'],
      true,
    );
    assert(
      command.indexOf('--tsconfig tsconfig.my.json') !== -1,
      '--tsconfig should be honored',
    );
  });

  it('honors --tstarget for apidocs', () => {
    var run = require('../../bin/generate-apidocs');
    var command = run(
      ['node', 'bin/generate-apidocs', '--tstarget', 'es2017'],
      true,
    );
    assert(
      command.indexOf('--tstarget es2017') !== -1,
      '--tstarget should be honored',
    );
  });

  it('honors --skip-public-assets for apidocs', () => {
    var run = require('../../bin/generate-apidocs');
    var command = run(
      ['node', 'bin/generate-apidocs', '--skip-public-assets'],
      true,
    );
    assert(
      command.indexOf('--skip-public-assets') !== -1,
      '--skip-public-assets should be honored',
    );
  });

  it('honors --html-file for apidocs', () => {
    var run = require('../../bin/generate-apidocs');
    var command = run(
      ['node', 'bin/generate-apidocs', '--html-file=my.html'],
      true,
    );
    assert(
      command.indexOf('--html-file=my.html') !== -1,
      '--html-file should be honored',
    );
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
      true,
    );
    assert(
      command.indexOf('--config tslint.my.json') !== -1,
      '--config should be honored',
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
      true,
    );
    assert(
      command.indexOf('--project tsonfig') !== -1,
      '--project should be honored',
    );
  });

  it('runs prettier against ts files', done => {
    var run = require('../../bin/run-prettier');
    var childProcess = run(
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
    var run = require('../../bin/run-clean');
    var command = run(
      ['node', 'bin/run-clean', 'tsconfig.json', 'dist', 'api-docs'],
      true,
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
      true,
    );
    assert(command.indexOf('rm -rf ./dist') !== -1);
  });

  describe('with LERNA_ROOT_PATH', () => {
    const repoRoot = path.join(__dirname, '../../../..');
    before(() => (process.env.LERNA_ROOT_PATH = repoRoot));

    it('sets --skip-public-assets for apidocs', () => {
      var run = require('../../bin/generate-apidocs');
      var command = run(['node', 'bin/generate-apidocs'], true);
      assert(
        command.indexOf('--skip-public-assets') !== -1,
        '--skip-public-assets should be set by default',
      );
    });

    it('sets --html-file for apidocs', () => {
      var run = require('../../bin/generate-apidocs');
      var command = run(['node', 'bin/generate-apidocs'], true);
      assert(
        command.indexOf('--html-file ts-test-proj.html') !== -1,
        '--html-file should be set to the package name by default',
      );
    });

    it('sets --project option for tsc', () => {
      var run = require('../../bin/compile-package');
      var command = run(['node', 'bin/compile-package'], true);
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
  this.timeout(30000);
  var cwd = process.cwd();
  var projectDir = path.resolve(__dirname, './fixtures');

  function cleanup() {
    var run = require('../../bin/run-clean');
    run(['node', 'bin/run-clean', 'test/mocha.opts']);
  }

  beforeEach(() => {
    process.chdir(projectDir);
    cleanup();
  });

  afterEach(() => {
    cleanup();
    process.chdir(cwd);
  });

  it('loads built-in mocha.opts file', () => {
    var run = require('../../bin/run-mocha');
    var command = run(['node', 'bin/run-mocha', '"dist/test"'], true);
    const builtInMochaOptsFile = path.join(
      __dirname,
      '../../config/mocha.opts',
    );
    assert(
      command.indexOf(builtInMochaOptsFile) !== -1,
      '--opts should be set by default',
    );
  });

  it('honors --opts option', () => {
    var run = require('../../bin/run-mocha');
    var command = run(
      ['node', 'bin/run-mocha', '--opts custom/mocha.opts', '"dist/test"'],
      true,
    );
    assert(
      command.indexOf('--opts custom/mocha.opts') !== -1,
      '--opts custom/mocha.opts should be honored',
    );
  });

  it('loads mocha.opts specific project file', () => {
    var run = require('../../bin/run-mocha');
    const buitInMochaOptsPath = path.join(__dirname, '../../config/mocha.opts');
    const destPath = path.join(__dirname, './fixtures/test/mocha.opts');

    fs.copyFileSync(buitInMochaOptsPath, destPath);

    var command = run(['node', 'bin/run-mocha', '"dist/test"'], true);
    assert(
      command.indexOf('--opts') === -1,
      'should skip built-in mocha.opts file when specific project file exist',
    );
  });
});
