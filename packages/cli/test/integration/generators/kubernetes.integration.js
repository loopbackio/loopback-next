// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const testlab = require('@loopback/testlab');
const TestSandbox = testlab.TestSandbox;
const fs = require('fs-extra');
const generator = path.join(__dirname, '../../../generators/kubernetes');
const SINGLE_PACKAGE = require('../../fixtures/kubernetes/single-package');
const MONO_REPO = require('../../fixtures/kubernetes/monorepo');
const testUtils = require('../../test-utils');
const sandbox = new TestSandbox(path.resolve(__dirname, '../.sandbox'));
const expect = require('@loopback/testlab').expect;

describe('lb4 kubernetes', function () {
  // eslint-disable-next-line no-invalid-this
  this.timeout(30000);

  beforeEach('reset sandbox', async () => {
    await sandbox.reset();
  });

  it('creates kubernetes templates for mono repo', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(path.resolve(sandbox.path), () =>
        testUtils.givenLBProject(path.resolve(sandbox.path), {
          excludePackageJSON: true,
          additionalFiles: MONO_REPO,
        }),
      ).withPrompts({
        helm: true,
        namespace: 'kraken'
      });
      let expectedResultsPath = path.resolve(__dirname, '../../fixtures/kubernetes/', 'test-results', 'monorepo');
      for (let file of ['pkg1-deployment.yaml', 'pkg2-deployment.yaml', 'pkg2-service.yaml', 'pkg1-service.yaml']) {
        let result = await fs.readFile(path.join(sandbox.path, 'helm', 'templates', file));
        let expected = await fs.readFile(path.join(expectedResultsPath, file));
        expect(result.equals(expected)).to.be.true;
      }
  });

  it('creates kubernetes templates for single packages', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(path.resolve(sandbox.path), () =>
        testUtils.givenLBProject(path.resolve(sandbox.path), {
          excludePackageJSON: true,
          additionalFiles: SINGLE_PACKAGE,
        }),
      ).withPrompts({
        helm: true,
        namespace: 'kraken'
      });
  });
});
