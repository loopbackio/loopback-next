// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  appendFile,
  copy,
  emptyDir,
  ensureDir,
  ensureDirSync,
  mkdtempSync,
  outputFile,
  outputJson,
  pathExists,
  readFile,
  remove,
} from 'fs-extra';
import {join, parse, resolve} from 'path';

/**
 * Options for a test sandbox
 */
export interface TestSandboxOptions {
  /**
   * The `subdir` controls if/how the sandbox creates a subdirectory under the
   * root path. It has one of the following values:
   *
   * - `true`: Creates a unique subdirectory. This will be the default behavior.
   * - `false`: Uses the root path as the target directory without creating a
   * subdirectory.
   * - a string such as `sub-dir-1`: creates a subdirectory with the given value.
   */
  subdir: boolean | string;
}

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
   * @example
   * ```ts
   * // Create a sandbox as a unique temporary subdirectory under the rootPath
   * const sandbox = new TestSandbox(rootPath);
   * const sandbox = new TestSandbox(rootPath, {subdir: true});
   *
   * // Create a sandbox in the root path directly
   * // This is same as the old behavior
   * const sandbox = new TestSandbox(rootPath, {subdir: false});
   *
   * // Create a sandbox in the `test1` subdirectory of the root path
   * const sandbox = new TestSandbox(rootPath, {subdir: 'test1'});
   * ```
   *
   * @param rootPath - Root path of the TestSandbox. If relative it will be
   * resolved against the current directory.
   * @param options - Options to control if/how the sandbox creates a
   * subdirectory for the sandbox. If not provided, the sandbox
   * will automatically creates a unique temporary subdirectory. This allows
   * sandboxes with the same root path can be used in parallel during testing.
   */
  constructor(rootPath: string, options?: TestSandboxOptions) {
    rootPath = resolve(rootPath);
    ensureDirSync(rootPath);
    options = {subdir: true, ...options};
    const subdir = typeof options.subdir === 'string' ? options.subdir : '.';
    if (options.subdir !== true) {
      this._path = resolve(rootPath, subdir);
    } else {
      // Create a unique temporary directory under the root path
      // See https://nodejs.org/api/fs.html#fs_fs_mkdtempsync_prefix_options
      this._path = mkdtempSync(join(rootPath, `/${process.pid}`));
    }
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
   * @param transform - Optional. A function to transform the file content.
   */
  async copyFile(
    src: string,
    dest?: string,
    transform?: (content: string) => string,
  ): Promise<void> {
    dest = dest
      ? resolve(this.path, dest)
      : resolve(this.path, parse(src).base);

    if (transform == null) {
      await copy(src, dest);
    } else {
      let content = await readFile(src, 'utf-8');
      content = transform(content);
      await outputFile(dest, content, {encoding: 'utf-8'});
    }

    if (parse(src).ext === '.js' && (await pathExists(src + '.map'))) {
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
    return outputJson(dest, data, {spaces: 2});
  }

  /**
   * Creates a new file and writes the given data as a UTF-8-encoded text.
   *
   * @param dest - Destination filename, optionally including a relative path.
   * @param data - The text to write.
   */
  async writeTextFile(dest: string, data: string): Promise<void> {
    dest = resolve(this.path, dest);
    return outputFile(dest, data, 'utf-8');
  }
}
