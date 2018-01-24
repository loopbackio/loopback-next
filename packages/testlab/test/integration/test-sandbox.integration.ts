// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TestSandbox, expect} from '../..';
import {resolve} from 'path';
import {createHash} from 'crypto';
import * as util from 'util';
import {remove, pathExists, readFile} from 'fs-extra';

describe('TestSandbox integration tests', () => {
  let sandbox: TestSandbox;
  let path: string;
  const COPY_FILE = 'copy-me.txt';
  const COPY_FILE_PATH = resolve(
    __dirname,
    '../../../test/fixtures',
    COPY_FILE,
  );
  let fileContent: string;

  before(getCopyFileContents);
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
    await compareFiles(resolve(path, COPY_FILE));
  });

  it('copies and renames the file to the sandbox', async () => {
    const rename = 'copy.me.js';
    await sandbox.copyFile(COPY_FILE_PATH, rename);
    expect(await pathExists(resolve(path, COPY_FILE))).to.be.False();
    expect(await pathExists(resolve(path, rename))).to.be.True();
    await compareFiles(resolve(path, rename));
  });

  it('copies file to a directory', async () => {
    const dir = 'test';
    await sandbox.mkdir(dir);
    const rename = `${dir}/${COPY_FILE}`;
    await sandbox.copyFile(COPY_FILE_PATH, rename);
    expect(await pathExists(resolve(path, rename))).to.be.True();
    await compareFiles(resolve(path, rename));
  });

  it('deletes the test sandbox', async () => {
    await sandbox.delete();
    expect(await pathExists(path)).to.be.False();
  });

  describe('after deleting sandbox', () => {
    const ERR: string =
      'TestSandbox instance was deleted. Create a new instance.';

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

  async function compareFiles(path1: string) {
    const file = await readFile(path1, 'utf8');
    expect(file).to.equal(fileContent);
  }

  function createSandbox() {
    sandbox = new TestSandbox(resolve(__dirname, 'sandbox'));
  }

  function givenPath() {
    path = sandbox.getPath();
  }

  async function deleteSandbox() {
    if (!await pathExists(path)) return;
    await remove(sandbox.getPath());
  }

  async function getCopyFileContents() {
    fileContent = await readFile(COPY_FILE_PATH, 'utf8');
  }
});
