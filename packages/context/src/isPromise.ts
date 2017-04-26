// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
  if (!value)
    return false;
  if (typeof value !== 'object' && typeof value !== 'function')
    return false;
  return typeof (value as Promise<T>).then === 'function';
}
