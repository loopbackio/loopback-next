// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const fs = require('fs-extra');
const assert = require('yeoman-assert');
const git = require('../../../generators/copyright/git');

const generator = path.join(__dirname, '../../../generators/copyright');
const {spdxLicenseList} = require('../../../generators/copyright/header');
const FIXTURES = path.join(__dirname, '../../fixtures/copyright');
const LOCATION = 'single-package';
const PROJECT_ROOT = path.join(FIXTURES, LOCATION);
const testUtils = require('../../test-utils');

// Establish the year(s)
let year = new Date().getFullYear();
if (year !== 2020) year = `2020,${year}`;

describe('lb4 copyright with git', function () {
  // eslint-disable-next-line no-invalid-this
  this.timeout(30000);

  before('add files not tracked by git', async () => {
    await fs.outputFile(
      path.join(PROJECT_ROOT, '.sandbox/file-not-tracked.js'),
      `
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

function test() {}
`,
    );
  });

  after('reset sandbox', async () => {
    await fs.remove(path.join(PROJECT_ROOT, '.sandbox'));
  });

  after('reset local changes ', async () => {
    // Revert changes made by the test against git-tracked fixtures
    await git(FIXTURES, `checkout -- ${LOCATION}`);
  });

  it('updates copyright/license headers with options', async () => {
    await testUtils.executeGenerator(generator).cd(PROJECT_ROOT).withOptions({
      owner: 'ACME Inc.',
      license: 'ISC',
      gitOnly: true,
      // Set `localConfigOnly` to skip searching for `.yo-rc.json` to change
      // the destination root
      localConfigOnly: true,
    });

    // git tracked files are changed
    assertHeader(
      ['src/application.ts', 'lib/no-header.js'],
      `// Copyright ACME Inc. ${year}. All Rights Reserved.`,
      '// Node module: myapp',
      `// This file is licensed under the ${spdxLicenseList['isc'].name}.`,
      `// License text available at ${spdxLicenseList['isc'].url}`,
    );

    // non git-tracked files are not touched
    assertHeader(
      ['.sandbox/file-not-tracked.js'],
      '// Copyright IBM Corp. 2020. All Rights Reserved.',
      '// Node module: @loopback/cli',
      '// This file is licensed under the MIT License.',
      '// License text available at https://opensource.org/licenses/MIT',
    );
  });
});

function assertHeader(fileNames, ...expected) {
  if (typeof fileNames === 'string') {
    fileNames = [fileNames];
  }
  for (const f of fileNames) {
    const file = path.join(FIXTURES, LOCATION, f);
    for (const line of expected) {
      assert.fileContent(file, line);
    }
  }
}
