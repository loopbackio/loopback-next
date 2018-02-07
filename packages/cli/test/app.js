// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const generator = path.join(__dirname, '../generators/app');
const props = {
  name: 'myApp',
  description: 'My app for LoopBack 4',
};

const tests = require('./project')(generator, props, 'application');
const baseTests = require('./base-generator')(generator);

describe('app-generator extending BaseGenerator', baseTests);
describe('generator-loopback4:app', tests);
describe('app-generator specfic files', () => {
  before(() => {
    return helpers.run(generator).withPrompts(props);
  });
  it('generates all the proper files', () => {
    assert.file('src/application.ts');
    assert.fileContent(
      'src/application.ts',
      /class MyAppApplication extends RestApplication/
    );
    assert.fileContent('src/application.ts', /constructor\(/);
    assert.fileContent('src/application.ts', /async start\(/);
    assert.fileContent('src/application.ts', /BootComponent/);

    assert.file('src/index.ts');
    assert.fileContent('src/index.ts', /new MyAppApplication/);
    assert.fileContent('src/index.ts', /await app.start\(\);/);

    assert.file('src/controllers/ping.controller.ts');
    assert.fileContent(
      'src/controllers/ping.controller.ts',
      /export class PingController/
    );
    assert.fileContent('src/controllers/ping.controller.ts', /@inject/);
    assert.fileContent(
      'src/controllers/ping.controller.ts',
      /@get\('\/ping'\)/
    );
    assert.fileContent('src/controllers/ping.controller.ts', /ping\(\)/);
    assert.fileContent(
      'src/controllers/ping.controller.ts',
      /\'\@loopback\/openapi\-v2\'/
    );

    assert.file;
  });
});
