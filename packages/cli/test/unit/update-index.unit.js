// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const updateIndex = require('../../lib/update-index');
const assert = require('yeoman-assert');
const path = require('path');
const util = require('util');
const fs = require('fs');
const writeFileAsync = util.promisify(fs.writeFile);

const testlab = require('@loopback/testlab');
const expect = testlab.expect;
const TestSandbox = testlab.TestSandbox;

// Test Sandbox
const SANDBOX_PATH = path.resolve(__dirname, '.sandbox');
const sandbox = new TestSandbox(SANDBOX_PATH);
const expectedFile = path.join(SANDBOX_PATH, 'index.ts');

describe('update-index unit tests', () => {
  beforeEach('reset sandbox', () => sandbox.reset());

  it('creates index.ts when not present', async () => {
    await updateIndex(SANDBOX_PATH, 'test.ts');
    assert.file(expectedFile);
    assert.fileContent(expectedFile, /export \* from '.\/test';/);
  });

  it('appends to existing index.ts when present', async () => {
    await writeFileAsync(
      path.join(SANDBOX_PATH, 'index.ts'),
      `export * from './first';\n`,
    );
    await updateIndex(SANDBOX_PATH, 'test.ts');
    assert.file(expectedFile);
    assert.fileContent(expectedFile, /export \* from '.\/first'/);
    assert.fileContent(expectedFile, /export \* from '.\/test'/);
  });

  it('throws an error when given a non-ts file', async () => {
    expect(updateIndex(SANDBOX_PATH, 'test.js')).to.be.rejectedWith(
      /test.js must be a TypeScript \(.ts\) file/,
    );
  });
});
