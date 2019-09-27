// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {pathExists, readFile, remove, writeJSON} from 'fs-extra';
import {resolve} from 'path';
import {expect, TestSandbox} from '../..';

const FIXTURES = resolve(__dirname, '../../../fixtures');

describe('TestSandbox integration tests', () => {
  let sandbox: TestSandbox;
  let path: string;
  const COPY_FILE = 'copy-me.txt';
  const COPY_FILE_PATH = resolve(FIXTURES, COPY_FILE);

  beforeEach(createSandbox);
  beforeEach(givenPath);
  afterEach(deleteSandbox);

  it('returns path of sandbox and it exists', async () => {
    expect(path).to.be.a.String();
    expect(await pathExists(path)).to.be.True();
  });

  it('creates a directory in the sandbox', async () => {
    const dir = 'controllers';
    await sandbox.mkdir(dir);
    expect(await pathExists(resolve(path, dir))).to.be.True();
  });

  it('copies a file to the sandbox', async () => {
    await sandbox.copyFile(COPY_FILE_PATH);
    expect(await pathExists(resolve(path, COPY_FILE))).to.be.True();
    await expectFilesToBeIdentical(COPY_FILE_PATH, resolve(path, COPY_FILE));
  });

  it('copies and renames the file to the sandbox', async () => {
    const rename = 'copy.me.js';
    await sandbox.copyFile(COPY_FILE_PATH, rename);
    expect(await pathExists(resolve(path, COPY_FILE))).to.be.False();
    expect(await pathExists(resolve(path, rename))).to.be.True();
    await expectFilesToBeIdentical(COPY_FILE_PATH, resolve(path, rename));
  });

  it('copies file to a directory', async () => {
    const dir = 'test';
    const rename = `${dir}/${COPY_FILE}`;
    await sandbox.copyFile(COPY_FILE_PATH, rename);
    expect(await pathExists(resolve(path, rename))).to.be.True();
    await expectFilesToBeIdentical(COPY_FILE_PATH, resolve(path, rename));
  });

  it('updates source map path for a copied file', async () => {
    const file = 'test.js';
    const resolvedFile = resolve(__dirname, '../fixtures/test.js');
    const sourceMapString = `//# sourceMappingURL=${resolvedFile}.map`;

    await sandbox.copyFile(resolvedFile);
    const fileContents = (await readFile(resolve(path, file), 'utf8')).split(
      '\n',
    );

    expect(fileContents.pop()).to.equal(sourceMapString);
  });

  it('creates a JSON file in the sandbox', async () => {
    await sandbox.writeJsonFile('data.json', {key: 'value'});
    const fullPath = resolve(path, 'data.json');
    expect(await pathExists(fullPath)).to.be.True();
    const content = await readFile(fullPath, 'utf-8');
    expect(content).to.equal('{\n  "key": "value"\n}\n');
  });

  it('creates a text file in the sandbox', async () => {
    await sandbox.writeTextFile('data.txt', 'Hello');
    const fullPath = resolve(path, 'data.txt');
    expect(await pathExists(fullPath)).to.be.True();
    const content = await readFile(fullPath, 'utf-8');
    expect(content).to.equal('Hello');
  });

  it('resets the sandbox', async () => {
    const file = 'test.js';
    const resolvedFile = resolve(__dirname, '../fixtures/test.js');
    await sandbox.copyFile(resolvedFile);
    await sandbox.reset();
    expect(await pathExists(resolve(path, file))).to.be.False();
  });

  it('decaches files from npm require when sandbox is reset', async () => {
    const file = 'test.json';
    await writeJSON(resolve(path, file), {x: 1});
    const data = require(resolve(path, file));
    expect(data).to.be.eql({x: 1});
    await sandbox.reset();
    await writeJSON(resolve(path, file), {x: 2});
    const data2 = require(resolve(path, file));
    expect(data2).to.be.eql({x: 2});
  });

  it('deletes the test sandbox', async () => {
    await sandbox.delete();
    expect(await pathExists(path)).to.be.False();
  });

  describe('after deleting sandbox', () => {
    const ERR = 'TestSandbox instance was deleted. Create a new instance.';

    beforeEach(callSandboxDelete);

    it('throws an error when trying to call getPath()', () => {
      expect(() => sandbox.getPath()).to.throw(ERR);
    });

    it('throws an error when trying to call mkdir()', async () => {
      await expect(sandbox.mkdir('test')).to.be.rejectedWith(ERR);
    });

    it('throws an error when trying to call copy()', async () => {
      await expect(sandbox.copyFile(COPY_FILE_PATH)).to.be.rejectedWith(ERR);
    });

    it('throws an error when trying to call reset()', async () => {
      await expect(sandbox.reset()).to.be.rejectedWith(ERR);
    });

    it('throws an error when trying to call delete() again', async () => {
      await expect(sandbox.delete()).to.be.rejectedWith(ERR);
    });
  });

  async function callSandboxDelete() {
    await sandbox.delete();
  }

  async function expectFilesToBeIdentical(original: string, copied: string) {
    const originalContent = await readFile(original, 'utf8');
    const copiedContent = await readFile(copied, 'utf8');
    expect(copiedContent).to.equal(originalContent);
  }

  function createSandbox() {
    sandbox = new TestSandbox(resolve(__dirname, '../../.sandbox'));
  }

  function givenPath() {
    path = sandbox.getPath();
  }

  async function deleteSandbox() {
    if (!(await pathExists(path))) return;
    await remove(sandbox.getPath());
  }
});
