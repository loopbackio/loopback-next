// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This module contains types for values and/or promises as well as a set of
 * utility methods to handle values and/or promises.
 */

/**
 * A class constructor accepting arbitrary arguments.
 */
export type Constructor<T> =
  // tslint:disable-next-line:no-any
  new (...args: any[]) => T;

// tslint:disable-next-line:no-any
export type BoundValue = any;

/**
 * Representing a value or promise. This type is used to represent results of
 * synchronous/asynchronous resolution of values.
 */
export type ValueOrPromise<T> = T | Promise<T>;

export type MapObject<T> = {[name: string]: T};

/**
 * Check whether a value is a Promise-like instance.
 * Recognizes both native promises and third-party promise libraries.
 *
 * @param value The value to check.
 */
export function isPromiseLike<T>(
  value: T | PromiseLike<T> | undefined,
): value is PromiseLike<T> {
  if (!value) return false;
  if (typeof value !== 'object' && typeof value !== 'function') return false;
  return typeof (value as PromiseLike<T>).then === 'function';
}

/**
 * Get nested properties by path
 * @param value Value of an object
 * @param path Path to the property
 */
export function getDeepProperty(value: BoundValue, path: string): BoundValue {
  const props = path.split('.').filter(Boolean);
  for (const p of props) {
    if (value == null) {
      return value;
    }
    value = value[p];
  }
  return value;
}

/**
 * Resolve entries of an object into a new object with the same keys. If one or
 * more entries of the source object are resolved to a promise by the `resolver`
 * function, this method returns a promise which will be resolved to the new
 * object with fully resolved entries.
 *
 * @example
 *
 * - Example 1: resolve all entries synchronously
 * ```ts
 * const result = resolveMap({a: 'x', b: 'y'}, v => v.toUpperCase());
 * ```
 * The `result` will be `{a: 'X', b: 'Y'}`.
 *
 * - Example 2: resolve one or more entries asynchronously
 * ```ts
 * const result = resolveMap({a: 'x', b: 'y'}, v =>
 *   Promise.resolve(v.toUpperCase()),
 * );
 * ```
 * The `result` will be a promise of `{a: 'X', b: 'Y'}`.
 *
 * @param map The original object containing the source entries
 * @param resolver A function resolves an entry to a value or promise. It will
 * be invoked with the property value, the property name, and the source object.
 */
export function resolveMap<T, V>(
  map: MapObject<T>,
  resolver: (val: T, key: string, map: MapObject<T>) => ValueOrPromise<V>,
): ValueOrPromise<MapObject<V>> {
  const result: MapObject<V> = {};
  let asyncResolvers: PromiseLike<void>[] | undefined = undefined;

  const setter = (key: string) => (val: V) => {
    if (val !== undefined) {
      // Only set the value if it's not undefined so that the default value
      // for a key will be honored
      result[key] = val;
    }
  };

  for (const key in map) {
    const valueOrPromise = resolver(map[key], key, map);
    if (isPromiseLike(valueOrPromise)) {
      if (!asyncResolvers) asyncResolvers = [];
      asyncResolvers.push(valueOrPromise.then(setter(key)));
    } else {
      if (valueOrPromise !== undefined) {
        // Only set the value if it's not undefined so that the default value
        // for a key will be honored
        result[key] = valueOrPromise;
      }
    }
  }

  if (asyncResolvers) {
    return Promise.all(asyncResolvers).then(() => result);
  } else {
    return result;
  }
}

/**
 * Resolve entries of an array into a new array with the same indexes. If one or
 * more entries of the source array are resolved to a promise by the `resolver`
 * function, this method returns a promise which will be resolved to the new
 * array with fully resolved entries.
 *
 * @example
 *
 * - Example 1: resolve all entries synchronously
 * ```ts
 * const result = resolveList(['a', 'b'], v => v.toUpperCase());
 * ```
 * The `result` will be `['A', 'B']`.
 *
 * - Example 2: resolve one or more entries asynchronously
 * ```ts
 * const result = resolveList(['a', 'b'], v =>
 *   Promise.resolve(v.toUpperCase()),
 * );
 * ```
 * The `result` will be a promise of `['A', 'B']`.
 *
 * @param list The original array containing the source entries
 * @param resolver A function resolves an entry to a value or promise. It will
 * be invoked with the property value, the property index, and the source array.
 */
export function resolveList<T, V>(
  list: T[],
  resolver: (val: T, index: number, list: T[]) => ValueOrPromise<V>,
): ValueOrPromise<V[]> {
  const result: V[] = new Array<V>(list.length);
  let asyncResolvers: PromiseLike<void>[] | undefined = undefined;

  const setter = (index: number) => (val: V) => {
    result[index] = val;
  };

  // tslint:disable-next-line:prefer-for-of
  for (let ix = 0; ix < list.length; ix++) {
    const valueOrPromise = resolver(list[ix], ix, list);
    if (isPromiseLike(valueOrPromise)) {
      if (!asyncResolvers) asyncResolvers = [];
      asyncResolvers.push(valueOrPromise.then(setter(ix)));
    } else {
      result[ix] = valueOrPromise;
    }
  }

  if (asyncResolvers) {
    return Promise.all(asyncResolvers).then(() => result);
  } else {
    return result;
  }
}

/**
 * Try to run an action that returns a promise or a value
 * @param action A function that returns a promise or a value
 * @param finalAction A function to be called once the action
 * is fulfilled or rejected (synchronously or asynchronously)
 */
export function tryWithFinally<T>(
  action: () => ValueOrPromise<T>,
  finalAction: () => void,
): ValueOrPromise<T> {
  let result: ValueOrPromise<T>;
  try {
    result = action();
  } catch (err) {
    finalAction();
    throw err;
  }
  if (isPromiseLike(result)) {
    // Once (promise.finally)[https://github.com/tc39/proposal-promise-finally
    // is supported, the following can be simplifed as
    // `result = result.finally(finalAction);`
    result = result.then(
      val => {
        finalAction();
        return val;
      },
      err => {
        finalAction();
        throw err;
      },
    );
  } else {
    finalAction();
  }
  return result;
}
