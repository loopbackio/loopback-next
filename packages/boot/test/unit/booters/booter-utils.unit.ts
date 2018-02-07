// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {discoverFiles, isClass, loadClassesFromFiles} from '../../../index';
import {resolve} from 'path';
import {TestSandbox, expect} from '@loopback/testlab';

describe('booter-utils unit tests', () => {
  const SANDBOX_PATH = resolve(__dirname, '../../../.sandbox');
  const sandbox = new TestSandbox(SANDBOX_PATH);

  beforeEach(resetSandbox);

  describe('discoverFiles()', () => {
    beforeEach(setupSandbox);

    it('discovers files matching a nested glob pattern', async () => {
      const expected = [
        resolve(SANDBOX_PATH, 'empty.artifact.js'),
        resolve(SANDBOX_PATH, 'nested/multiple.artifact.js'),
      ];
      const glob = '/**/*.artifact.js';

      const files = await discoverFiles(glob, SANDBOX_PATH);
      expect(files.sort()).to.eql(expected.sort());
    });

    it('discovers files matching a non-nested glob pattern', async () => {
      const expected = [resolve(SANDBOX_PATH, 'empty.artifact.js')];
      const glob = '/*.artifact.js';

      const files = await discoverFiles(glob, SANDBOX_PATH);
      expect(files).to.eql(expected);
    });

    it('discovers no files for a unknown glob', async () => {
      const glob = '/xyz';
      const files = await discoverFiles(glob, SANDBOX_PATH);
      expect(files).to.be.eql([]);
    });

    async function setupSandbox() {
      await sandbox.copyFile(
        resolve(__dirname, '../../fixtures/empty.artifact.js'),
      );
      await sandbox.copyFile(
        resolve(__dirname, '../../fixtures/empty.artifact.js.map'),
      );
      await sandbox.copyFile(
        resolve(__dirname, '../../fixtures/multiple.artifact.js'),
        'nested/multiple.artifact.js',
      );
      await sandbox.copyFile(
        resolve(__dirname, '../../fixtures/multiple.artifact.js.map'),
        'nested/multiple.artifact.js.map',
      );
    }
  });

  describe('isClass()', () => {
    it('returns true given a class', () => {
      expect(isClass(class Thing {})).to.be.True();
    });
  });

  describe('loadClassesFromFiles()', () => {
    it('returns an array of classes from a file', async () => {
      // Copying a test file to sandbox that contains a function and 2 classes
      await sandbox.copyFile(
        resolve(__dirname, '../../fixtures/multiple.artifact.js'),
      );
      await sandbox.copyFile(
        resolve(__dirname, '../../fixtures/multiple.artifact.js.map'),
      );
      const files = [resolve(SANDBOX_PATH, 'multiple.artifact.js')];
      const NUM_CLASSES = 2; // Number of classes in above file

      const classes = await loadClassesFromFiles(files);
      expect(classes).to.have.lengthOf(NUM_CLASSES);
      expect(classes[0]).to.be.a.Function();
      expect(classes[1]).to.be.a.Function();
    });

    it('returns an empty array given an empty file', async () => {
      await sandbox.copyFile(
        resolve(__dirname, '../../fixtures/empty.artifact.js'),
      );
      await sandbox.copyFile(
        resolve(__dirname, '../../fixtures/empty.artifact.js.map'),
      );
      const files = [resolve(SANDBOX_PATH, 'empty.artifact.js')];

      const classes = await loadClassesFromFiles(files);
      expect(classes).to.be.an.Array();
      expect(classes).to.be.empty();
    });

    it('throws an error given a non-existent file', async () => {
      const files = [resolve(SANDBOX_PATH, 'fake.artifact.js')];
      expect(loadClassesFromFiles(files)).to.eventually.throw();
    });
  });

  async function resetSandbox() {
    await sandbox.reset();
  }
});
