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
export type KeyValueFilter = {
  /**
   * Glob string to use to filter returned keys (i.e. `userid.*`). All
   * connectors are required to support `*` and `?`. They may also support
   * additional special characters that are specific to the backing database.
   */
  match: string;
};

/**
 * Key/Value operations for connector implementations
 */
export interface KeyValueRepository<T extends Model> extends Repository<T> {
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
   * Get an Iterator for matching keys
   *
   * @param filter Filter for keys
   * @param options Options for the operation
   * @returns An async iteratable iterator of keys so that the return value can
   * be used with `for-await-of`.
   */
  keys?(filter?: KeyValueFilter, options?: Options): AsyncIterable<string>;
}
