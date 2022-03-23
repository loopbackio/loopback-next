'use strict';

const path = require('path');
const {assertFilesToMatchSnapshot} = require('../../snapshots');

const testlab = require('@loopback/testlab');
const expect = testlab.expect;
const TestSandbox = testlab.TestSandbox;

const generator = path.join(__dirname, '../../../generators/cache');

// Test Sandbox
const sandbox = new TestSandbox(path.resolve(__dirname, '../.sandbox'));
const SANDBOX_FILES = require('../../fixtures/cache').SANDBOX_FILES;
const testUtils = require('../../test-utils');

const props = {
  dataSource: 'cache',
};

describe('cache-generator', /** @this {Mocha.Suite} */ function () {
  before('reset sandbox', () => sandbox.reset());

  it('does not run without package.json', () => {
    return expect(
      testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {excludePackageJSON: true}),
        )
        .withPrompts(props),
    ).to.be.rejectedWith(/No package.json found in/);
  });

  it('does not run without the "@loopback/core" dependency', () => {
    return expect(
      testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {excludeLoopbackCore: true}),
        )
        .withPrompts(props),
    ).to.be.rejectedWith(/No `@loopback\/core` package found/);
  });

  describe('basic cache', () => {
    it('generates all files', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withPrompts(props);

      assertModel();
      assertRepository();
      assertProvider();
    });
  });
});

function assertModel(options) {
  assertFiles(options, 'src/models/index.ts', 'src/models/cache.model.ts');
}

function assertRepository(options) {
  assertFiles(
    options,
    'src/repositories/index.ts',
    'src/repositories/cache.repository.ts',
  );
}

function assertProvider(options) {
  assertFiles(
    options,
    'src/providers/index.ts',
    'src/providers/cache-strategy.provider.ts',
  );
}

function assertFiles(options, ...files) {
  options = {rootPath: sandbox.path, ...options};
  assertFilesToMatchSnapshot(options, ...files);
}
