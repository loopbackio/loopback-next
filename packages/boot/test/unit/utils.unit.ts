// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  readFolder,
  flatten,
  filterExts,
  normalizeToArray,
  discoverArtifactFiles,
} from '../..';
import {resolve} from 'path';

describe('utils', () => {
  let rootDir: string;

  describe('readFolder()', () => {
    // tslint:disable-next-line:no-any
    let expected: any;

    before(getRootDir);

    it('reads a folder and nested folders by default', () => {
      expected = [
        resolve(rootDir, 'index.js'),
        resolve(rootDir, 'index.js.map'),
        resolve(rootDir, 'index.d.ts'),
        [
          [
            resolve(rootDir, 'controllers/admin/admin.controller.d.ts'),
            resolve(rootDir, 'controllers/admin/admin.controller.js'),
            resolve(rootDir, 'controllers/admin/admin.controller.js.map'),
          ],
          resolve(rootDir, 'controllers/hello.controller.d.ts'),
          resolve(rootDir, 'controllers/hello.controller.js'),
          resolve(rootDir, 'controllers/hello.controller.js.map'),
        ],
        [
          resolve(rootDir, 'repositories/test.repository.d.ts'),
          resolve(rootDir, 'repositories/test.repository.js'),
          resolve(rootDir, 'repositories/test.repository.js.map'),
        ],
      ];

      const files: string[] = readFolder(resolve(rootDir));
      expect(files.sort()).to.be.eql(expected.sort());
    });

    it('reads a folder and ignored nested folders', () => {
      expected = [
        resolve(rootDir, 'controllers'),
        resolve(rootDir, 'index.js'),
        resolve(rootDir, 'index.js.map'),
        resolve(rootDir, 'index.d.ts'),
        resolve(rootDir, 'repositories'),
      ];
      const files: string[] = readFolder(resolve(rootDir), false);
      expect(files.sort()).to.be.eql(expected.sort());
    });

    it('handles invalid folder name', () => {
      const files: string[] = readFolder(resolve(rootDir, 'non-existent'));
      expect(files).to.be.a.Array();
      expect(files).to.have.lengthOf(0);
    });
  });

  describe('flatten()', () => {
    it('flattens an array of arrays', () => {
      const input = ['a', ['b', 'c'], 'd', ['e', ['f']]];
      const expected: string[] = ['a', 'b', 'c', 'd', 'e', 'f'];
      const actual: string[] = flatten(input);
      expect(actual.sort()).to.be.eql(expected.sort());
    });
  });

  describe('filterExts()', () => {
    const input = ['a.ts', 'b.ts', 'a.js', 'b.js', 'a.js.map', '.b.js.map'];
    it('filters an array for matching extension', () => {
      const filter: string[] = ['.ts'];
      const expected: string[] = ['a.ts', 'b.ts'];
      const result: string[] = filterExts(input, filter);
      expect(result.sort()).to.be.eql(expected.sort());
    });

    it('filters an array for matching extensions', () => {
      const filter: string[] = ['.ts', '.js'];
      const expected: string[] = ['a.ts', 'b.ts', 'a.js', 'b.js'];
      const result: string[] = filterExts(input, filter);
      expect(result.sort()).to.be.eql(expected.sort());
    });

    it('returns input when no filter is applied', () => {
      const result: string[] = filterExts(input, []);
      expect(result.sort()).to.be.eql(input.sort());
    });
  });

  describe('normalizeToArray()', () => {
    it('converts a string to an array', () => {
      const result: string[] = normalizeToArray('hello');
      expect(result).to.be.an.Array();
      expect(result).to.be.eql(['hello']);
    });

    it('returns an array given an array', () => {
      const input: string[] = ['hello'];
      const result: string[] = normalizeToArray(input);
      expect(result).to.be.eql(input);
    });
  });

  describe('discoverArtifactFiles()', () => {
    before(getRootDir);

    it('discovers correct artifact files in nested folders with Array input', () => {
      const dirs: string[] = [resolve(rootDir)];
      const exts: string[] = ['.controller.js'];
      const expected: string[] = [
        resolve(rootDir, 'controllers/hello.controller.js'),
        resolve(rootDir, 'controllers/admin/admin.controller.js'),
      ];
      const result: string[] = discoverArtifactFiles(dirs, exts);
      expect(result.sort()).to.be.eql(expected.sort());
    });

    it('discovers correct artifact files in nested folders with String input', () => {
      const expected: string[] = [
        resolve(rootDir, 'controllers/hello.controller.js'),
        resolve(rootDir, 'controllers/admin/admin.controller.js'),
      ];
      const result: string[] = discoverArtifactFiles(
        resolve(rootDir),
        '.controller.js',
      );
      expect(result.sort()).to.be.eql(expected.sort());
    });

    it('discovers correct artifact files and ignores nested folders', () => {
      const dirs: string[] = [resolve(rootDir)];
      const exts: string[] = ['.controller.js'];
      const expected: string[] = [];
      const result: string[] = discoverArtifactFiles(dirs, exts, false);
      expect(result).to.be.eql(expected);
    });

    it('discovers correct artifact files and ignores nested folders', () => {
      const expected: string[] = [
        resolve(rootDir, 'controllers/hello.controller.js'),
      ];
      const result: string[] = discoverArtifactFiles(
        resolve(rootDir, 'controllers'),
        '.controller.js',
        false,
      );
      expect(result).to.be.eql(expected);
    });

    it('discovers correct artifact files when given relative paths with a basePath', () => {
      const expected: string[] = [
        resolve(rootDir, 'controllers/hello.controller.js'),
        resolve(rootDir, 'controllers/admin/admin.controller.js'),
      ];
      const result: string[] = discoverArtifactFiles(
        'controllers',
        '.controller.js',
        true,
        rootDir,
      );
      expect(result.sort()).to.be.eql(expected.sort());
    });

    it('discovers correct artifact files in multiple dirs', () => {
      const dirs: string[] = ['controllers', 'repositories'];
      const exts: string[] = ['.controller.js', '.repository.js'];
      const expected: string[] = [
        resolve(rootDir, 'controllers/hello.controller.js'),
        resolve(rootDir, 'controllers/admin/admin.controller.js'),
        resolve(rootDir, 'repositories/test.repository.js'),
      ];
      const result: string[] = discoverArtifactFiles(dirs, exts, true, rootDir);
      expect(result.sort()).to.be.eql(expected.sort());
    });
  });

  function getRootDir(): void {
    rootDir =
      process.cwd().indexOf('packages') > -1
        ? 'dist/test/fakeApp/'
        : 'packages/boot/dist/test/fakeApp/';
  }
});
