// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const fs = require('fs');
const os = require('os');
const {promisify} = require('util');
const path = require('path');
const tildify = require('tildify');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const generator = path.join(__dirname, '../../../generators/app');
const cliVersion = require('../../../package.json').version;
const build = require('@loopback/build');
const props = {
  name: 'my-app',
  description: 'My app for LoopBack 4',
};
const {expect} = require('@loopback/testlab');

const {assertFilesToMatchSnapshot} = require('../../snapshots');

const tests = require('../lib/project-generator')(
  generator,
  props,
  'application',
);
const baseTests = require('../lib/base-generator')(generator);

const readFile = promisify(fs.readFile);

describe('app-generator extending BaseGenerator', baseTests);
describe('generator-loopback4:app', tests);
describe('app-generator specific files', () => {
  before(() => {
    return helpers.run(generator).withPrompts(props);
  });
  it('generates all the proper files', () => {
    assertFilesToMatchSnapshot(
      {},
      'src/application.ts',
      'src/sequence.ts',
      'src/index.ts',
      'src/controllers/ping.controller.ts',
      'src/__tests__/acceptance/ping.controller.acceptance.ts',
      'src/__tests__/acceptance/home-page.acceptance.ts',
      'src/__tests__/acceptance/test-helper.ts',
    );
    assert.jsonFileContent('.yo-rc.json', {
      '@loopback/cli': {
        version: cliVersion,
      },
    });
  });

  it('generates database migration script', () => {
    assertFilesToMatchSnapshot({}, 'src/migrate.ts');
  });

  it('generates openapi spec script', () => {
    assertFilesToMatchSnapshot({}, 'src/openapi-spec.ts');
    assert.fileContent(
      'package.json',
      /"openapi-spec": "node \.\/dist\/openapi-spec"/,
    );
  });

  it('generates docker files', () => {
    assertFilesToMatchSnapshot({}, 'Dockerfile', '.dockerignore');

    assert.fileContent('package.json', /"docker:build": "docker build/);
    assert.fileContent('package.json', /"docker:run": "docker run/);
  });

  it('creates npm script "clean"', () => {
    assert.fileContent(
      'package.json',
      '"clean": "lb-clean dist *.tsbuildinfo .eslintcache"',
    );
  });

  it('creates npm script "migrate-db"', async () => {
    const pkg = JSON.parse(await readFile('package.json'));
    expect(pkg.scripts).to.have.property('migrate', 'node ./dist/migrate');
  });

  it('creates .gitignore', () => {
    assert.fileContent('.gitignore', /^\*\.tsbuildinfo$/m);
  });
});

describe('app-generator with docker disabled', () => {
  before(() => {
    return helpers
      .run(generator)
      .withOptions({docker: false})
      .withPrompts(props);
  });
  it('does not generate docker files', () => {
    assert.noFile('Dockerfile');
    assert.noFile('.dockerignore');

    assert.noFileContent('package.json', /"docker:build": "docker build/);
    assert.noFileContent('package.json', /"docker:run": "docker run/);
  });
});

describe('app-generator with --applicationName', () => {
  before(() => {
    return helpers
      .run(generator)
      .withOptions({applicationName: 'MyApp'})
      .withPrompts(props);
  });
  it('generates all the proper files', () => {
    assertFilesToMatchSnapshot({}, 'src/application.ts');
  });
  it('generates the application with RepositoryMixin', () => {
    assertFilesToMatchSnapshot({}, 'src/application.ts');
  });
});

describe('app-generator with --apiconnect', () => {
  before(() => {
    return helpers
      .run(generator)
      .withOptions({apiconnect: true})
      .withPrompts(props);
  });
  it('adds imports for ApiConnectComponent', () => {
    assertFilesToMatchSnapshot({}, 'src/application.ts');
    assert.fileContent('package.json', '"@loopback/apiconnect"');
  });
});

// The test takes about 1 min to install dependencies
function testFormat() {
  before(createAppAndInstallDeps);
  /** @this {Mocha.Context} */
  function createAppAndInstallDeps() {
    this.timeout(90 * 1000);
    return helpers
      .run(generator)
      .withOptions({
        applicationName: 'MyApp',
        format: true,
        // Make sure `npm install` happens
        skipInstall: false,
        // Disable npm log and progress bar
        npmInstall: {silent: true, progress: false},
        yarnInstall: {silent: true},
        // Disable npm stdio
        spawn: {
          stdio: 'ignore',
        },
      })
      .withPrompts(props);
  }
  it('generates all the proper files', () => {
    assert.file('src/application.ts');
    assert.fileContent('src/application.ts', /class MyApp extends BootMixin\(/);
  });
  it('generates the application with RepositoryMixin', () => {
    assert.file('src/application.ts');
    assert.fileContent(
      'src/application.ts',
      /RepositoryMixin\(RestApplication\)/,
    );
  });
}

// Skip the test for CI
// eslint-disable-next-line no-unused-expressions
process.env.CI && !process.env.DEBUG
  ? describe.skip
  : describe('app-generator with --format', testFormat);

/** For testing if the generator handles default values properly */
describe('app-generator with default values', () => {
  const rootDir = path.join(__dirname, '../../../../../');
  const defaultValProjPath = path.join(rootDir, 'sandbox/default-value-app');
  const sandbox = path.join(rootDir, 'sandbox');
  const pathToDefValApp = path.join(defaultValProjPath, 'default-value-app');
  const cwd = process.cwd();
  const defaultValProps = {
    name: '',
    description: 'An app to test out default values',
    outdir: '',
  };

  before(async () => {
    // default-value-app should not exist at this point
    assert.equal(fs.existsSync(defaultValProjPath), false);
    assert.equal(fs.existsSync(pathToDefValApp), false);
    return (
      helpers
        .run(generator)
        .inDir(defaultValProjPath)
        // Mark it private to prevent accidental npm publication
        .withOptions({private: true})
        .withPrompts(defaultValProps)
    );
  });
  it('scaffold a new app for default-value-app', async () => {
    // default-value-app should be created at this point
    assert.equal(fs.existsSync(pathToDefValApp), true);
  });
  after(() => {
    process.chdir(sandbox);
    build.clean(['node', 'run-clean', defaultValProjPath]);
    process.chdir(cwd);
  });
});

/** For testing the support of tilde path as the input of project path.
 * Use different paths to test out the support of `~` when the test runs outside of home dir.
 */
describe('app-generator with tilde project path', () => {
  const rootDir = path.join(__dirname, '../../../../../');
  // tildify the path:
  let sandbox = path.join(rootDir, 'sandbox/tilde-path-app');
  let pathWithTilde = tildify(sandbox);
  const cwd = process.cwd();

  // If the test runs outside $home directory
  const runsOutsideRoot =
    process.env.CI && !process.env.DEBUG && tildify(sandbox) === sandbox
      ? true
      : false;
  if (runsOutsideRoot) {
    sandbox = path.join(os.homedir(), '.lb4sandbox/tilde-path-app');
    pathWithTilde = '~/.lb4sandbox/tilde-path-app';
  }
  const tildePathProps = {
    name: 'tildified-path',
    description: 'An app to test out tilde project path',
    outdir: pathWithTilde,
  };

  before(givenScaffoldedApp);
  /** @this {Mocha.Context} */
  async function givenScaffoldedApp() {
    // Increase the timeout to accommodate slow CI build machines
    this.timeout(30 * 1000);
    // check it with full path. tilde-path-app should not exist at this point
    assert.equal(fs.existsSync(sandbox), false);
    await helpers
      .run(generator)
      .inDir(sandbox)
      // Mark it private to prevent accidental npm publication
      .withOptions({private: true})
      .withPrompts(tildePathProps);
  }

  it('scaffold a new application for tilde-path-app', async () => {
    // tilde-path-app should be created at this point
    assert.equal(fs.existsSync(sandbox), true);
  });

  after(cleanup);
  /** @this {Mocha.Context} */
  function cleanup() {
    // Increase the timeout to accommodate slow CI build machines
    this.timeout(30 * 1000);

    // Handle special case - Skipping... not inside the project root directory.
    if (runsOutsideRoot) {
      process.chdir(sandbox);
    } else {
      process.chdir(rootDir);
    }
    build.clean(['node', 'run-clean', sandbox]);
    process.chdir(cwd);
  }
});
