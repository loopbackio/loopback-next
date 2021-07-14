// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor} from '@loopback/core';
import debugFactory from 'debug';
import path from 'path';
import {promisify} from 'util';
const glob = promisify(require('glob'));

const debug = debugFactory('loopback:boot:booter-utils');

/**
 * Returns all files matching the given glob pattern relative to root
 *
 * @param pattern - A glob pattern
 * @param root - Root folder to start searching for matching files
 * @returns Array of discovered files
 */
export async function discoverFiles(
  pattern: string,
  root: string,
): Promise<string[]> {
  return glob(pattern, {root: root});
}

/**
 * Given a function, returns true if it is a class, false otherwise.
 *
 * @param target - The function to check if it's a class or not.
 * @returns True if target is a class. False otherwise.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
 * @param files - An array of string of absolute file paths
 * @param projectRootDir - The project root directory
 * @returns An array of Class constructors from a file
 */
export function loadClassesFromFiles(
  files: string[],
  projectRootDir: string,
): Constructor<{}>[] {
  const classes: Constructor<{}>[] = [];
  for (const file of files) {
    debug('Loading artifact file %j', path.relative(projectRootDir, file));
    const moduleObj = require(file);
    for (const k in moduleObj) {
      const exported = moduleObj[k];
      if (isClass(exported)) {
        debug('  add %s (class %s)', k, exported.name);
        classes.push(exported);
      } else {
        debug('  skip non-class %s', k);
      }
    }
  }

  return classes;
}
