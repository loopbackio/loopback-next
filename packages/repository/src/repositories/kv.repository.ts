// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Repository} from './repository';
import {Options, DataObject} from '../common-types';
import {Model} from '../model';

/**
 * Filter for keys
 */
export type KVFilter = {
  /**
   * Glob string to use to filter returned keys (i.e. `userid.*`). All
   * connectors are required to support `*` and `?`. They may also support
   * additional special characters that are specific to the backing database.
   */
  match: string;
};

/**
 * Polyfill for AsyncIterator before es.next is ready
 */
// tslint:disable:no-any
export interface AsyncIterator<T> {
  next(value?: any): Promise<IteratorResult<T>>;
  return?(value?: any): Promise<IteratorResult<T>>;
  throw?(e?: any): Promise<IteratorResult<T>>;
}

/**
 * Key/Value operations for connector implementations
 */
export interface KVRepository<T extends Model> extends Repository<T> {
  /**
   * Delete an entry by key
   *
   * @param key Key for the entry
   * @param options Options for the operation
   */
  delete(key: string, options?: Options): Promise<void>;

  /**
   * Delete all entries
   *
   * @param key Key for the entry
   * @param options Options for the operation
   */
  deleteAll(options?: Options): Promise<void>;

  /**
   * Get an entry by key
   *
   * @param key Key for the entry
   * @param options Options for the operation
   * @returns A promise of the entry
   */
  get(key: string, options?: Options): Promise<T>;

  /**
   * Set an entry with key/value
   *
   * @param key Key for the entry
   * @param value Value for the entry
   * @param options Options for the operation
   */
  set(key: string, value: DataObject<T>, options?: Options): Promise<void>;

  /**
   * Set up ttl for an entry by key
   *
   * @param key Key for the entry
   * @param options Options for the operation
   */
  expire(key: string, ttl: number, options?: Options): Promise<void>;

  /**
   * Get ttl for an entry by key
   *
   * @param key Key for the entry
   * @param options Options for the operation
   * @returns A promise of the TTL value
   */
  ttl?(key: string, options?: Options): Promise<number>;

  /**
   * Fetch all keys
   *
   * @param filter Filter for keys
   * @param options Options for the operation
   * @returns A promise of an array of keys for all entries
   */
  keys?(filter?: KVFilter, options?: Options): Promise<string[]>;

  /**
   * Get an Iterator for matching keys
   *
   * @param filter Filter for keys
   * @param options Options for the operation
   * @returns An iterator of keys.
   *
   * FIXME(rfeng): It's probably better to return an object that supports async
   * iteration ("iterable" if it has a Symbol.asyncIterator method that returns
   * an AsyncIterator object) so that the return value can be used with
   * `for-await-of`.
   */
  iterateKeys?(filter?: KVFilter, options?: Options): AsyncIterator<string>;
}
