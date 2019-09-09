// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const assert = require('yeoman-assert');
const {expect, TestSandbox} = require('@loopback/testlab');
const path = require('path');
const generator = path.join(__dirname, '../../../generators/import-lb3-models');
const {expectFileToMatchSnapshot} = require('../../snapshots');
const testUtils = require('../../test-utils');

const SANDBOX_PATH = path.resolve(__dirname, '../.sandbox');
const sandbox = new TestSandbox(SANDBOX_PATH);

// In this test suite we invoke the full generator with mocked prompts
// and inspect the generated model file(s).
// Such tests are slow to run, we strive to keep only few of them.
// Use unit tests to verify the conversion from LB3 to LB4 model definition,
// see tests/unit/import-lb3-models/migrate-model.test.ts

const {
  loadLb3App,
} = require('../../../generators/import-lb3-models/lb3app-loader');

const COFFEE_SHOP_EXAMPLE = require.resolve(
  '../../../../../examples/lb3-application/lb3app/server/server',
);

describe('lb4 import-lb3-models', function() {
  require('../lib/base-generator')(generator, {args: ['path-to-lb3-app']})();

  before(function preloadCoffeeShopExampleApp() {
    // The CoffeeShop example app takes some time to load :(
    // eslint-disable-next-line no-invalid-this
    this.timeout(10000);
    return loadLb3App(COFFEE_SHOP_EXAMPLE);
  });

  beforeEach('reset sandbox', () => sandbox.reset());

  it('imports CoffeeShop model from lb3-example app', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH))
      .withArguments(COFFEE_SHOP_EXAMPLE)
      .withPrompts({
        modelNames: ['CoffeeShop'],
      });

    // The default outDir is "src/models"
    const outDir = path.join(SANDBOX_PATH, 'src/models');

    // Verify the source code generated for the model
    expectFileToMatchSnapshot(`${outDir}/coffee-shop.model.ts`);

    // Verify that the index file was updated
    expectFileToMatchSnapshot(`${outDir}/index.ts`);
  });

  it('honours `outDir` option', async () => {
    const outDir = path.join(SANDBOX_PATH, 'my-models');

    await testUtils
      .executeGenerator(generator)
      .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH))
      .withArguments(COFFEE_SHOP_EXAMPLE)
      .withPrompts({
        modelNames: ['CoffeeShop'],
      })
      .withOptions({
        outDir,
      });

    assert.file([`${outDir}/coffee-shop.model.ts`, `${outDir}/index.ts`]);
  });

  it('reports a helpful error when the selected model does not exist', () => {
    return expect(
      testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH))
        .withArguments(COFFEE_SHOP_EXAMPLE)
        .withPrompts({
          modelNames: ['ModelDoesNotExist'],
        }),
    ).to.be.rejectedWith(
      'Unknown model name ModelDoesNotExist. Available models: Application, ' +
        'AccessToken, User, RoleMapping, Role, ACL, Scope, CoffeeShop.',
    );
  });
});
