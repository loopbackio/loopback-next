// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  appendFile,
  copy,
  emptyDir,
  ensureDir,
  ensureDirSync,
  pathExists,
  remove,
  writeFile,
  writeJson,
} from 'fs-extra';
import {parse, resolve} from 'path';

/**
 * TestSandbox class provides a convenient way to get a reference to a
 * sandbox folder in which you can perform operations for testing purposes.
 */
export class TestSandbox {
  // Path of the TestSandbox
  private _path?: string;

  public get path(): string {
    if (!this._path) {
      throw new Error(
        `TestSandbox instance was deleted. Create a new instance.`,
      );
    }
    return this._path;
  }

  /**
   * Will create a directory if it doesn't already exist. If it exists, you
   * still get an instance of the TestSandbox.
   *
   * @param path - Path of the TestSandbox. If relative (it will be resolved relative to cwd()).
   */
  constructor(path: string) {
    // resolve ensures path is absolute / makes it absolute (relative to cwd())
    this._path = resolve(path);
    ensureDirSync(this.path);
  }

  /**
   * Returns the path of the TestSandbox
   */
  getPath(): string {
    return this.path;
  }

  /**
   * Resets the TestSandbox. (Remove all files in it).
   */
  async reset(): Promise<void> {
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
    await remove(this.path);
    delete this._path;
  }

  /**
   * Makes a directory in the TestSandbox
   *
   * @param dir - Name of directory to create (relative to TestSandbox path)
   */
  async mkdir(dir: string): Promise<void> {
    await ensureDir(resolve(this.path, dir));
  }

  /**
   * Copies a file from src to the TestSandbox. If copying a `.js` file which
   * has an accompanying `.js.map` file in the src file location, the dest file
   * will have its sourceMappingURL updated to point to the original file as
   * an absolute path so you don't need to copy the map file.
   *
   * @param src - Absolute path of file to be copied to the TestSandbox
   * @param dest - Optional. Destination filename of the copy operation
   * (relative to TestSandbox). Original filename used if not specified.
   */
  async copyFile(src: string, dest?: string): Promise<void> {
    dest = dest
      ? resolve(this.path, dest)
      : resolve(this.path, parse(src).base);

    await copy(src, dest);

    if (parse(src).ext === '.js' && pathExists(src + '.map')) {
      const srcMap = src + '.map';
      await appendFile(dest, `\n//# sourceMappingURL=${srcMap}`);
    }
  }

  /**
   * Creates a new file and writes the given data serialized as JSON.
   *
   * @param dest - Destination filename, optionally including a relative path.
   * @param data - The data to write.
   */
  async writeJsonFile(dest: string, data: unknown): Promise<void> {
    dest = resolve(this.path, dest);
    const destDir = parse(dest).dir;
    await ensureDir(destDir);
    return writeJson(dest, data, {spaces: 2});
  }

  /**
   * Creates a new file and writes the given data as a UTF-8-encoded text.
   *
   * @param dest - Destination filename, optionally including a relative path.
   * @param data - The text to write.
   */
  async writeTextFile(dest: string, data: string): Promise<void> {
    dest = resolve(this.path, dest);
    const destDir = parse(dest).dir;
    await ensureDir(destDir);
    return writeFile(dest, data, {encoding: 'utf-8'});
  }
}
