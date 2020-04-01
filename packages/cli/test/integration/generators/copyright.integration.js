// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const testlab = require('@loopback/testlab');
const TestSandbox = testlab.TestSandbox;

const generator = path.join(__dirname, '../../../generators/copyright');
const {spdxLicenseList} = require('../../../generators/copyright/license');
const SANDBOX_FILES = require('../../fixtures/copyright/single-package')
  .SANDBOX_FILES;
const testUtils = require('../../test-utils');

// Test Sandbox
const sandbox = new TestSandbox(path.resolve(__dirname, '../.sandbox'));

const year = new Date().getFullYear();

describe('lb4 copyright', function () {
  // eslint-disable-next-line no-invalid-this
  this.timeout(30000);

  beforeEach('reset sandbox', async () => {
    await sandbox.reset();
  });

  // FIXME(rfeng): https://www.npmjs.com/package/inquirer-autocomplete-prompt
  // is not friendly with yeoman-test. The prompt cannot be skipped during tests.
  it.skip('updates copyright/license headers with prompts', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () =>
        testUtils.givenLBProject(sandbox.path, {
          excludePackageJSON: true,
          additionalFiles: SANDBOX_FILES,
        }),
      )
      .withPrompts({owner: 'ACME Inc.', license: 'ISC'})
      .withOptions({gitOnly: false});

    assertHeader(
      ['src/application.ts', 'lib/no-header.js'],
      `// Copyright ACME Inc. ${year}. All Rights Reserved.`,
      '// Node module: myapp',
      `// This file is licensed under the ${spdxLicenseList['isc'].name}.`,
      `// License text available at ${spdxLicenseList['isc'].url}`,
    );
  });

  it('updates copyright/license headers with options', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () =>
        testUtils.givenLBProject(sandbox.path, {
          excludePackageJSON: true,
          additionalFiles: SANDBOX_FILES,
        }),
      )
      .withOptions({owner: 'ACME Inc.', license: 'ISC', gitOnly: false});

    assertHeader(
      ['src/application.ts', 'lib/no-header.js'],
      `// Copyright ACME Inc. ${year}. All Rights Reserved.`,
      '// Node module: myapp',
      `// This file is licensed under the ${spdxLicenseList['isc'].name}.`,
      `// License text available at ${spdxLicenseList['isc'].url}`,
    );
  });

  it('updates LICENSE and package.json', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () =>
        testUtils.givenLBProject(sandbox.path, {
          excludePackageJSON: true,
          additionalFiles: SANDBOX_FILES,
        }),
      )
      .withOptions({
        owner: 'ACME Inc.',
        license: 'ISC',
        gitOnly: false,
        updateLicense: true,
      });

    assert.fileContent(
      path.join(sandbox.path, 'package.json'),
      '"license": "ISC"',
    );
    assert.fileContent(
      path.join(sandbox.path, 'package.json'),
      '"copyright.owner": "ACME Inc."',
    );

    /*
    Copyright (c) ACME Inc. 2020. All Rights Reserved.
    Node module: myapp

    */
    assert.fileContent(
      path.join(sandbox.path, 'LICENSE'),
      'This project is licensed under the ISC License, full text below.',
    );
    assert.fileContent(
      path.join(sandbox.path, 'LICENSE'),
      `Copyright (c) ACME Inc. ${year}. All Rights Reserved.`,
    );
    assert.fileContent(
      path.join(sandbox.path, 'LICENSE'),
      'Node module: myapp',
    );
  });
});

function assertHeader(fileNames, ...expected) {
  if (typeof fileNames === 'string') {
    fileNames = [fileNames];
  }
  for (const f of fileNames) {
    const file = path.join(sandbox.path, f);
    for (const line of expected) {
      assert.fileContent(file, line);
    }
  }
}
