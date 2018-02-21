// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor} from '@loopback/context';
import {promisify} from 'util';
const glob = promisify(require('glob'));

/**
 * Returns all files matching the given glob pattern relative to root
 *
 * @param pattern A glob pattern
 * @param root Root folder to start searching for matching files
 * @returns {string[]} Array of discovered files
 */
export async function discoverFiles(
  pattern: string,
  root: string,
): Promise<string[]> {
  return await glob(pattern, {root: root});
}

/**
 * Given a function, returns true if it is a class, false otherwise.
 *
 * @param target The function to check if it's a class or not.
 * @returns {boolean} True if target is a class. False otherwise.
 */
// tslint:disable-next-line:no-any
export function isClass(target: any): target is Constructor<any> {
  return (
    typeof target === 'function' && target.toString().indexOf('class') === 0
  );
}

/**
 * Returns an Array of Classes from given files. Works by requiring the file,
 * identifying the exports from the file by getting the keys of the file
 * and then testing each exported member to see if it's a class or not.
 *
 * @param files An array of string of absolute file paths
 * @returns {Constructor<{}>[]} An array of Class constructors from a file
 */
export function loadClassesFromFiles(files: string[]): Constructor<{}>[] {
  const classes: Array<Constructor<{}>> = [];
  for (const file of files) {
    const data = require(file);
    for (const cls of Object.values(data)) {
      if (isClass(cls)) {
        classes.push(cls);
      }
    }
  }

  return classes;
}
