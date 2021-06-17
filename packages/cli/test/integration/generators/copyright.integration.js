// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const {expect, TestSandbox} = require('@loopback/testlab');

const generator = path.join(__dirname, '../../../generators/copyright');
const {spdxLicenseList} = require('../../../generators/copyright/license');
const SANDBOX_FILES =
  require('../../fixtures/copyright/single-package').SANDBOX_FILES;
const testUtils = require('../../test-utils');
const fs = require('fs');

// Test Sandbox
const sandbox = new TestSandbox(path.resolve(__dirname, '../.sandbox'));

const year = new Date().getFullYear();

describe('lb4 copyright', /** @this {Mocha.Suite} */ function () {
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
      .withOptions({
        owner: 'ACME Inc.',
        license: 'ISC',
        gitOnly: false,
      });

    assertHeader(
      ['src/application.ts', 'lib/no-header.js'],
      `// Copyright ACME Inc. ${year}. All Rights Reserved.`,
      '// Node module: myapp',
      `// This file is licensed under the ${spdxLicenseList['isc'].name}.`,
      `// License text available at ${spdxLicenseList['isc'].url}`,
    );

    assertNoHeader(
      ['node_modules/third-party.js'],
      `// Copyright ACME Inc. ${year}. All Rights Reserved.`,
      '// Node module: myapp',
      `// This file is licensed under the ${spdxLicenseList['isc'].name}.`,
      `// License text available at ${spdxLicenseList['isc'].url}`,
    );
  });

  it('updates custom copyright/license headers with options', async () => {
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
        license: 'CUSTOM',
        gitOnly: false,
      })
      .withPrompts({
        customLicenseLines: `
=============================================================================
Licensed Materials - Property of <%= owner %>
(C) Copyright <%= owner %> <%= years %>
US Government Users Restricted Rights - Use, duplication or disclosure
restricted by GSA ADP Schedule Contract with <%= owner %>.
=============================================================================`,
      });

    assertHeader(
      ['src/application.ts', 'lib/no-header.js'],
      `=============================================================================`,
      `Licensed Materials - Property of ACME Inc.`,
      `(C) Copyright ACME Inc. ${year}`,
      `US Government Users Restricted Rights - Use, duplication or disclosure`,
      `restricted by GSA ADP Schedule Contract with ACME Inc..`,
      `=============================================================================`,
    );
  });

  it('updates custom copyright/license headers with template', async () => {
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
        license: 'CUSTOM',
        gitOnly: false,
      });

    assertHeader(
      ['src/application.ts', 'lib/no-header.js'],
      `=============================================================================`,
      `Licensed Materials - Property of ACME Inc.`,
      `(C) Copyright ACME Inc. ${year}`,
      `US Government Users Restricted Rights - Use, duplication or disclosure`,
      `restricted by GSA ADP Schedule Contract with ACME Inc..`,
      `=============================================================================`,
    );
  });

  it('updates copyright/license headers with options.exclude', async () => {
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
        exclude: '**/*.js',
      });

    assertHeader(
      ['src/application.ts'],
      `// Copyright ACME Inc. ${year}. All Rights Reserved.`,
      '// Node module: myapp',
      `// This file is licensed under the ${spdxLicenseList['isc'].name}.`,
      `// License text available at ${spdxLicenseList['isc'].url}`,
    );

    assertNoHeader(
      ['lib/no-header.js', 'node_modules/third-party.js'],
      `// Copyright ACME Inc. ${year}. All Rights Reserved.`,
      '// Node module: myapp',
      `// This file is licensed under the ${spdxLicenseList['isc'].name}.`,
      `// License text available at ${spdxLicenseList['isc'].url}`,
    );
  });

  it('updates LICENSE and package.json for ISC', async () => {
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

    const licenseText = fs.readFileSync(
      path.join(sandbox.path, 'LICENSE'),
      'utf-8',
    );
    expect(licenseText).to.equal(
      `
Copyright (c) ACME Inc. ${year}.
Node module: myapp
This project is licensed under the ISC License, full text below.

--------

ISC License:

Copyright (c) 2004-2010 by Internet Systems Consortium, Inc. ("ISC")
Copyright (c) 1995-2003 by Internet Software Consortium

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND ISC DISCLAIMS ALL WARRANTIES WITH REGARD TO
THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS.
IN NO EVENT SHALL ISC BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR
CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA
OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS
ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS
SOFTWARE.
`.trimLeft(), // remove leading newline character,
    );
  });

  it('updates LICENSE and package.json for MIT', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () =>
        testUtils.givenLBProject(sandbox.path, {
          excludePackageJSON: true,
          additionalFiles: SANDBOX_FILES,
        }),
      )
      .withOptions({
        owner: 'The LoopBack Authors',
        license: 'MIT',
        gitOnly: false,
        updateLicense: true,
      });

    assert.fileContent(
      path.join(sandbox.path, 'package.json'),
      '"license": "MIT"',
    );
    assert.fileContent(
      path.join(sandbox.path, 'package.json'),
      '"copyright.owner": "The LoopBack Authors"',
    );

    const licenseText = fs.readFileSync(
      path.join(sandbox.path, 'LICENSE'),
      'utf-8',
    );
    expect(licenseText).to.equal(
      `
Copyright (c) The LoopBack Authors ${year}.
Node module: myapp
This project is licensed under the MIT License, full text below.

--------

MIT License

Copyright (c) The LoopBack Authors 2021

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
`.trimLeft(), // remove leading newline character,
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

function assertNoHeader(fileNames, ...expected) {
  if (typeof fileNames === 'string') {
    fileNames = [fileNames];
  }
  for (const f of fileNames) {
    const file = path.join(sandbox.path, f);
    for (const line of expected) {
      assert.noFileContent(file, line);
    }
  }
}
