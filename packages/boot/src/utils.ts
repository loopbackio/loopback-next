// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {statSync, readdirSync} from 'fs';
import {join, resolve} from 'path';
import {StringOrArr} from './types';
const debug = require('debug')('@loopback/boot:utils');

/**
 * Takes an absolute directory path and returns all files / folders in it. Can optionally
 * traverse nested folders.
 *
 * @param d Absolute path of directory to read
 * @param nested Read nested directories in the given directory or not. Defaults to true.
 */
// tslint:disable-next-line:no-any
export function readFolder(d: string, nested: boolean = true): any {
  // If not reading nested directories, read the current one and return
  if (!nested) {
    try {
      let files = readdirSync(d).map(f => join(d, f));
      return files;
    } catch (err) {
      debug(`Skipping ${d} in if(!recursive) because error: ${err}`);
      return [];
    }
  } else {
    try {
      // Recursively read nested directories
      if (statSync(d).isDirectory()) {
        return readdirSync(d).map(f => readFolder(join(d, f), nested));
      } else {
        return d;
      }
    } catch (err) {
      debug(`Skipping ${d} in else because error: ${err}`);
      return [];
    }
  }
}

/**
 * Takes an array which may contain nested arrays and flattens them into a single array
 *
 * @param arr Nested array of elements to flatten
 */
// tslint:disable-next-line:no-any
export function flatten(arr: any): any {
  return arr.reduce(
    // tslint:disable-next-line:no-any
    (flat: any, item: any) =>
      flat.concat(Array.isArray(item) ? flatten(item) : item),
    [],
  );
}

/**
 * Filters a list of strings to look for particular extension endings.
 *
 * @param arr A list of items to filter
 * @param exts A list of extensions to look in arr
 */
export function filterExts(arr: string[], exts: string[]): string[] {
  if (exts && exts.length === 0) return arr;
  return arr.filter(item => {
    let include = false;
    exts.forEach(ext => {
      if (item.indexOf(ext) === item.length - ext.length) {
        include = true;
      }
    });

    if (include) return item;
  });
}

/**
 * Normalize a string / list to be a list
 *
 * @param str String or string array to normalize
 */
export function normalizeToArray(str: string | string[]): string[] {
  if (typeof str === 'string') return [str];
  return str;
}

/**
 * Take a list of directories to search for artifact files in and filter
 * the list based on the list of extensions. Can optionally check nested folders.
 * If paths are relative, a rootDir path can be given to resolve absolute paths.
 *
 * @param dirs List of directories to search for artifacts in
 * @param exts List of extensions to filter files with artifacts
 * @param nested Checked nested folders recursively
 * @param basePath Base path for relative paths in dirs
 */
export function discoverArtifactFiles(
  dirs: StringOrArr,
  exts: StringOrArr = [],
  nested?: boolean,
  basePath?: string,
): string[] {
  dirs = normalizeToArray(dirs);
  exts = normalizeToArray(exts);
  let files: string[] = [];
  dirs.forEach(d => {
    if (basePath) d = resolve(basePath, d);
    files.push(readFolder(d, nested));
  });
  return filterExts(flatten(files), exts);
}
