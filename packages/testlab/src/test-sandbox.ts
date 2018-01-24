// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {tmpdir} from 'os';
import {createHash} from 'crypto';
import {resolve, join, parse} from 'path';
import * as util from 'util';
import {mkdirSync, existsSync, mkdir, copyFile, readFile, writeFile} from 'fs';
const promisify = util.promisify || require('util.promisify/implementation');
const rimrafAsync = promisify(require('rimraf'));
const mkdirAsync = promisify(mkdir);

// tslint:disable-next-line:no-any
let copyFileAsync: any;
if (copyFile) {
  copyFileAsync = promisify(copyFile);
} else {
  // Node 6 PolyFill for copyFile!
  copyFileAsync = async function(src: string, target: string) {
    const readFileAsync = promisify(readFile);
    const writeFileAsync = promisify(writeFile);
    const data = await readFileAsync(src);
    await writeFileAsync(target, data);
  };
}

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
    // Create directory if it doesn't already exist.
    if (!existsSync(this.path)) {
      this.create();
    }
  }

  /**
   * Syncronously creates the TestSandbox directory. It is syncronous because
   * it is called by the constructor.
   */
  private create(): void {
    mkdirSync(this.path);
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
    await rimrafAsync(this.path);
    this.create();
  }

  /**
   * Deletes the TestSandbox.
   */
  async delete(): Promise<void> {
    this.validateInst();
    await rimrafAsync(this.path);
    delete this.path;
  }

  /**
   * Makes a directory in the TestSandbox
   * @param dir Name of directory to create (relative to TestSandbox path)
   */
  async mkdir(dir: string): Promise<void> {
    this.validateInst();
    await mkdirAsync(resolve(this.path, dir));
  }

  /**
   * Copies a file from src to the TestSandbox.
   * @param src Absolute path of file to be copied to the TestSandbox
   * @param [dest] Optional. Destination filename of the copy operation
   * (relative to TestSandbox). Original filename used if not specified.
   */
  async copy(src: string, dest?: string): Promise<void> {
    this.validateInst();
    dest = dest
      ? resolve(this.path, dest)
      : resolve(this.path, parse(src).base);
    await copyFileAsync(src, dest);
  }
}
