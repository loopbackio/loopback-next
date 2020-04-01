// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, TestSandbox} from '@loopback/testlab';
import {resolve} from 'path';
import {discoverFiles, isClass, loadClassesFromFiles} from '../../..';

describe('booter-utils unit tests', () => {
  const sandbox = new TestSandbox(resolve(__dirname, '../../../.sandbox'));

  beforeEach('reset sandbox', () => sandbox.reset());

  describe('discoverFiles()', () => {
    beforeEach(setupSandbox);

    it('discovers files matching a nested glob pattern', async () => {
      const expected = [
        resolve(sandbox.path, 'empty.artifact.js'),
        resolve(sandbox.path, 'nested/multiple.artifact.js'),
      ];
      const glob = '/**/*.artifact.js';

      const files = await discoverFiles(glob, sandbox.path);
      expect(files.sort()).to.eql(expected.sort());
    });

    it('discovers files matching a non-nested glob pattern', async () => {
      const expected = [resolve(sandbox.path, 'empty.artifact.js')];
      const glob = '/*.artifact.js';

      const files = await discoverFiles(glob, sandbox.path);
      expect(files).to.eql(expected);
    });

    it('discovers no files for a unknown glob', async () => {
      const glob = '/xyz';
      const files = await discoverFiles(glob, sandbox.path);
      expect(files).to.be.eql([]);
    });

    async function setupSandbox() {
      await sandbox.copyFile(
        resolve(__dirname, '../../fixtures/empty.artifact.js'),
      );
      await sandbox.copyFile(
        resolve(__dirname, '../../fixtures/multiple.artifact.js'),
        'nested/multiple.artifact.js',
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
      const files = [resolve(sandbox.path, 'multiple.artifact.js')];
      const NUM_CLASSES = 2; // Number of classes in above file

      const classes = loadClassesFromFiles(files, sandbox.path);
      expect(classes).to.have.lengthOf(NUM_CLASSES);
      expect(classes[0]).to.be.a.Function();
      expect(classes[1]).to.be.a.Function();
    });

    it('returns an empty array given an empty file', async () => {
      await sandbox.copyFile(
        resolve(__dirname, '../../fixtures/empty.artifact.js'),
      );
      const files = [resolve(sandbox.path, 'empty.artifact.js')];

      const classes = loadClassesFromFiles(files, sandbox.path);
      expect(classes).to.be.an.Array();
      expect(classes).to.be.empty();
    });

    it('throws an error given a non-existent file', async () => {
      const files = [resolve(sandbox.path, 'fake.artifact.js')];
      expect(() => loadClassesFromFiles(files, sandbox.path)).to.throw(
        /Cannot find module/,
      );
    });
  });
});
