// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Apply a mapping function to the given iterator to produce a new iterator
 * with mapped values as its entries
 *
 * @param iterator An iterable object
 * @param mapper A function maps an entry to a new value
 */
export function* map<T, V>(
  iterator: Iterable<T>,
  mapper: (item: T) => V,
): Iterable<V> {
  for (const item of iterator) {
    yield mapper(item);
  }
}

/**
 * Take entries from the iterator to form a new one until the `predicator`
 * function returns `true`. Please note the last entry that satisfies the
 * condition is also included in the returned iterator.
 *
 * @param iterator An iterable object
 * @param predicator A function to check if the iteration should be done
 */
export function* takeUntil<T>(
  iterator: Iterable<T>,
  predicator: (item: T) => boolean,
): Iterable<T> {
  for (const item of iterator) {
    yield item; // Always take the item even filter returns true
    if (predicator(item)) break;
  }
}

/**
 * Take entries from the iterator to form a new one while the `predicator`
 * function returns `true`. Please note the last entry that satisfies the
 * condition is also included in the returned iterator.
 *
 * @param iterator An iterable object
 * @param predicator A function to check if the iteration should continue
 */
export function* takeWhile<T>(
  iterator: Iterable<T>,
  predicator: (item: T) => boolean,
): Iterable<T> {
  for (const item of iterator) {
    if (predicator(item)) yield item;
    else break;
  }
}

/**
 * Reduce the entries from the interator to be an aggregated value.
 *
 * @param iterator An iterable object
 * @param reducer A function that reconciles the previous result with the
 * current entry into a new result
 * @param initialValue The initial value for the result
 */
export function reduce<T, V>(
  iterator: Iterable<T>,
  reducer: (accumulator: V, currentValue: T) => V,
  initialValue: V,
): V {
  let accumulator = initialValue;
  for (const item of iterator) {
    accumulator = reducer(accumulator, item);
  }
  return accumulator;
}

/**
 * Filter the given iterator to produce a new iterator with only entries
 * satisfies the predicator
 *
 * @param iterator An iterable object
 * @param predicator A function to check if an entry should be included
 */
export function* filter<T>(
  iterator: Iterable<T>,
  predicator: (item: T) => boolean,
): Iterable<T> {
  for (const item of iterator) {
    if (predicator(item)) yield item;
  }
}
