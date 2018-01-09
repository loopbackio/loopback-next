// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// A temporary polyfill for util.promisify on Node.js 6.x
// Remove it as part of https://github.com/strongloop/loopback-next/issues/611

// tslint:disable:no-any

import * as util from 'util';

const nativePromisify = (util as any).promisify;

export function promisify<T>(
  func: (callback: (err: any, result: T) => void) => void,
): () => Promise<T>;
export function promisify<T, A1>(
  func: (arg1: A1, callback: (err: any, result: T) => void) => void,
): (arg1: A1) => Promise<T>;
export function promisify<T, A1, A2>(
  func: (arg1: A1, arg2: A2, callback: (err: any, result: T) => void) => void,
): (arg1: A1, arg2: A2) => Promise<T>;

/**
 * Polyfill promisify and use `util.promisify` if available
 * @param func A callback-style function
 */
export function promisify<T>(
  func: (...args: any[]) => void,
): (...args: any[]) => Promise<T> {
  if (nativePromisify) return nativePromisify(func);

  // The simplest implementation of Promisify
  return (...args) => {
    return new Promise((resolve, reject) => {
      try {
        func(...args, (err?: any, result?: any) => {
          if (err) reject(err);
          else resolve(result);
        });
      } catch (err) {
        reject(err);
      }
    });
  };
}
