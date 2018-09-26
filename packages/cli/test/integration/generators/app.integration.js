// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const generator = path.join(__dirname, '../../../generators/app');
const props = {
  name: 'my-app',
  description: 'My app for LoopBack 4',
};

const tests = require('../lib/project-generator')(
  generator,
  props,
  'application',
);
const baseTests = require('../lib/base-generator')(generator);

describe('app-generator extending BaseGenerator', baseTests);
describe('generator-loopback4:app', tests);
describe('app-generator specific files', () => {
  before(() => {
    return helpers.run(generator).withPrompts(props);
  });
  it('generates all the proper files', () => {
    assert.file('src/application.ts');
    assert.fileContent(
      'src/application.ts',
      /class MyAppApplication extends BootMixin\(/,
    );
    assert.fileContent(
      'src/application.ts',
      /ServiceMixin\(RepositoryMixin\(RestApplication\)\)/,
    );
    assert.fileContent('src/application.ts', /constructor\(/);
    assert.fileContent('src/application.ts', /this.projectRoot = __dirname/);

    assert.file('src/index.ts');
    assert.fileContent('src/index.ts', /new MyAppApplication/);
    assert.fileContent('src/index.ts', /await app.start\(\);/);

    assert.file('src/controllers/ping.controller.ts');
    assert.fileContent(
      'src/controllers/ping.controller.ts',
      /export class PingController/,
    );
    assert.fileContent('src/controllers/ping.controller.ts', /@inject/);
    assert.fileContent(
      'src/controllers/ping.controller.ts',
      /@get\('\/ping'\, \{/,
    );
    assert.fileContent('src/controllers/ping.controller.ts', /ping\(\)/);
    assert.fileContent(
      'src/controllers/ping.controller.ts',
      /\'\@loopback\/rest\'/,
    );
    assert.fileContent(
      'test/acceptance/ping.controller.acceptance.ts',
      /describe\('PingController'/,
    );
    assert.fileContent(
      'src/controllers/home-page.controller.ts',
      /export class HomePageController/,
    );
    assert.fileContent(
      'src/controllers/home-page.controller.ts',
      /homePage\(\)/,
    );
    assert.fileContent(
      'test/acceptance/home-page.controller.acceptance.ts',
      /describe\('HomePageController'/,
    );
    assert.fileContent(
      'test/acceptance/test-helper.ts',
      /export async function setupApplication/,
    );
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
});

// The test takes about 1 min to install dependencies
function testFormat() {
  before(function() {
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
        // Disable npm stdio
        spawn: {
          stdio: 'ignore',
        },
      })
      .withPrompts(props);
  });
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
process.env.CI && !process.env.DEBUG
  ? describe.skip
  : describe('app-generator with --format', testFormat);
