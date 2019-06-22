// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const promisify = require('util').promisify;

const downloadAndExtractExample = require('../../../generators/example/downloader');
const expect = require('@loopback/testlab').expect;
const fs = require('fs');
const TestSandbox = require('@loopback/testlab').TestSandbox;
const glob = promisify(require('glob'));
const path = require('path');

const readFile = promisify(fs.readFile);

const VALID_EXAMPLE = 'todo';
const SANDBOX_PATH = path.resolve(__dirname, '..', '.sandbox');
const sandbox = new TestSandbox(SANDBOX_PATH);

describe('cloneExampleFromGitHub (SLOW)', function() {
  // eslint-disable-next-line no-invalid-this
  this.timeout(20000);

  beforeEach('reset sandbox', () => sandbox.reset());

  it('extracts project files', async () => {
    const outDir = await downloadAndExtractExample(VALID_EXAMPLE, SANDBOX_PATH);
    const actualFiles = await glob('**', {
      cwd: outDir,
      ignore: 'node_modules/**',
    });

    // We must not assume that the files downloaded from the current master
    // branch are the same as the files we have in our current branch.
    // By doing so, we would prevent any meaningful changes from
    // landing in example repositories, since it will always fail the equality
    // test provided when new files are added, or when existing files are
    // removed as a part of refactor/cleanup.
    expect(actualFiles).to.containDeep([
      // These files are required in all our packages,
      // therefore it's safe to assume they will be always around.
      'README.md',
      'package.json',

      // We need to check a nested file to verify that directory structure
      // is preserved. Hopefully `src/index.ts will be always around,
      // independently on any refactorings and cleanups.
      'src/index.ts',
    ]);

    const packageJson = JSON.parse(await readFile(`${outDir}/package.json`));
    expect(packageJson).to.have.properties({
      name: `@loopback/example-${VALID_EXAMPLE}`,
    });
  });
});
