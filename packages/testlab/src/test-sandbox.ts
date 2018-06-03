// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {resolve, parse} from 'path';
import {
  copy,
  ensureDirSync,
  emptyDir,
  remove,
  ensureDir,
  pathExists,
  appendFile,
} from 'fs-extra';

/**
 * TestSandbox class provides a convenient way to get a reference to a
 * sandbox folder in which you can perform operations for testing purposes.
 */
export class TestSandbox {
  // Path of the TestSandbox
  private path: string;

  /**
   * Will create a directory if it doesn't already exist. If it exists, you
   * still get an instance of the TestSandbox.
   *
   * @param path Path of the TestSandbox. If relative (it will be resolved relative to cwd()).
   */
  constructor(path: string) {
    // resolve ensures path is absolute / makes it absolute (relative to cwd())
    this.path = resolve(path);
    ensureDirSync(this.path);
  }

  /**
   * This function ensures a valid instance is being used for operations.
   */
  private validateInst() {
    if (!this.path) {
      throw new Error(
        `TestSandbox instance was deleted. Create a new instance.`,
      );
    }
  }

  /**
   * Returns the path of the TestSandbox
   */
  getPath(): string {
    this.validateInst();
    return this.path;
  }

  /**
   * Resets the TestSandbox. (Remove all files in it).
   */
  async reset(): Promise<void> {
    this.validateInst();

    // Decache files from require's cache so future tests aren't affected incase
    // a file is recreated in sandbox with the same file name but different
    // contents after resetting the sandbox.
    for (const key in require.cache) {
      if (key.startsWith(this.path)) {
        delete require.cache[key];
      }
    }

    await emptyDir(this.path);
  }

  /**
   * Deletes the TestSandbox.
   */
  async delete(): Promise<void> {
    this.validateInst();
    await remove(this.path);
    delete this.path;
  }

  /**
   * Makes a directory in the TestSandbox
   *
   * @param dir Name of directory to create (relative to TestSandbox path)
   */
  async mkdir(dir: string): Promise<void> {
    this.validateInst();
    await ensureDir(resolve(this.path, dir));
  }

  /**
   * Copies a file from src to the TestSandbox. If copying a `.js` file which
   * has an accompanying `.js.map` file in the src file location, the dest file
   * will have its sourceMappingURL updated to point to the original file as
   * an absolute path so you don't need to copy the map file.
   *
   * @param src Absolute path of file to be copied to the TestSandbox
   * @param [dest] Optional. Destination filename of the copy operation
   * (relative to TestSandbox). Original filename used if not specified.
   */
  async copyFile(src: string, dest?: string): Promise<void> {
    this.validateInst();
    dest = dest
      ? resolve(this.path, dest)
      : resolve(this.path, parse(src).base);

    await copy(src, dest);

    if (parse(src).ext === '.js' && pathExists(src + '.map')) {
      const srcMap = src + '.map';
      await appendFile(dest, `\n//# sourceMappingURL=${srcMap}`);
    }
  }
}
