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
const SANDBOX_FILES = require('../../fixtures/copyright/monorepo')
  .SANDBOX_FILES;
const testUtils = require('../../test-utils');
const {spdxLicenseList} = require('../../../generators/copyright/header');

// Test Sandbox
const SANDBOX_PATH = path.resolve(__dirname, '..', '.sandbox');
const sandbox = new TestSandbox(SANDBOX_PATH);

const year = new Date().getFullYear();

describe('lb4 copyright for monorepo', function () {
  // eslint-disable-next-line no-invalid-this
  this.timeout(30000);

  beforeEach('reset sandbox', async () => {
    await sandbox.reset();
  });

  it('updates copyright/license headers', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(SANDBOX_PATH, () =>
        testUtils.givenLBProject(SANDBOX_PATH, {
          excludePackageJSON: true,
          additionalFiles: SANDBOX_FILES,
        }),
      )
      .withOptions({gitOnly: false, owner: 'ACME Inc.', license: 'MIT'});
    assertHeader(
      ['packages/pkg1/src/application.ts', 'packages/pkg1/lib/no-header.js'],
      `// Copyright ACME Inc. ${year}. All Rights Reserved.`,
      `// Node module: pkg1`,
      `// This file is licensed under the ${spdxLicenseList['apache-2.0'].name}.`,
      `// License text available at ${spdxLicenseList['apache-2.0'].url}`,
    );

    assertHeader(
      ['packages/pkg2/src/application.ts', 'packages/pkg2/lib/no-header.js'],
      `// Copyright ACME Inc. ${year}. All Rights Reserved.`,
      `// Node module: pkg2`,
      `// This file is licensed under the ${spdxLicenseList['isc'].name}.`,
      `// License text available at ${spdxLicenseList['isc'].url}`,
    );

    assertHeader(
      ['lib/no-header.js'],
      `#!/usr/bin/env node`,
      `// Copyright ACME Inc. ${year}. All Rights Reserved.`,
      `// Node module: mymonorepo`,
      `// This file is licensed under the ${spdxLicenseList['mit'].name}.`,
      `// License text available at ${spdxLicenseList['mit'].url}`,
    );
  });
});

function assertHeader(fileNames, ...expected) {
  if (typeof fileNames === 'string') {
    fileNames = [fileNames];
  }
  for (const f of fileNames) {
    const file = path.join(SANDBOX_PATH, f);
    for (const line of expected) {
      assert.fileContent(file, line);
    }
  }
}
