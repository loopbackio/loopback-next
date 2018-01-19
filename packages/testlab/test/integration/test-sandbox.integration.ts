// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TestSandbox, expect} from '../..';
import {existsSync, readFile as readFile_} from 'fs';
import {resolve} from 'path';
import {createHash} from 'crypto';
import * as util from 'util';
const promisify = util.promisify || require('util.promisify/implementation');
const rimraf = require('rimraf');
const readFile = promisify(readFile_);

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

  it('returns path of sandbox and it exists', () => {
    expect(path).to.be.a.String();
    expect(existsSync(path)).to.be.True();
  });

  it('creates a directory in the sandbox', async () => {
    const dir = 'controllers';
    await sandbox.mkdir(dir);
    expect(existsSync(resolve(path, dir))).to.be.True();
  });

  it('copies a file to the sandbox', async () => {
    await sandbox.copy(COPY_FILE_PATH);
    expect(existsSync(resolve(path, COPY_FILE))).to.be.True();
    await compareFiles(resolve(path, COPY_FILE));
  });

  it('copies and renames the file to the sandbox', async () => {
    const rename = 'copy.me.js';
    await sandbox.copy(COPY_FILE_PATH, rename);
    expect(existsSync(resolve(path, COPY_FILE))).to.be.False();
    expect(existsSync(resolve(path, rename))).to.be.True();
    await compareFiles(resolve(path, rename));
  });

  it('copies file to a directory', async () => {
    const dir = 'test';
    await sandbox.mkdir(dir);
    const rename = `${dir}/${COPY_FILE}`;
    await sandbox.copy(COPY_FILE_PATH, rename);
    expect(existsSync(resolve(path, rename))).to.be.True();
    await compareFiles(resolve(path, rename));
  });

  it('deletes the test sandbox', async () => {
    await sandbox.delete();
    expect(existsSync(path)).to.be.False();
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
      await expect(sandbox.copy(COPY_FILE_PATH)).to.be.rejectedWith(ERR);
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

  function deleteSandbox() {
    if (!existsSync(path)) return;
    try {
      rimraf.sync(sandbox.getPath());
    } catch (err) {
      console.log(`Failed to delete sandbox because: ${err}`);
    }
  }

  async function getCopyFileContents() {
    fileContent = await readFile(COPY_FILE_PATH, 'utf8');
  }
});
