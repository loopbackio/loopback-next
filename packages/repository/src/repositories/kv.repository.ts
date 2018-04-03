// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Repository} from './repository';
import {Options, DataObject} from '../common-types';
import {Model} from '../model';
import {Filter} from '../query';

/**
 * Key/Value operations for connector implementations
 */
export interface KVRepository<T extends Model> extends Repository<T> {
  /**
   * Delete an entry by key
   *
   * @param key Key for the entry
   * @param options Options for the operation
   * @returns Promise<true> if an entry is deleted for the key, otherwise
   * Promise<false>
   */
  delete(key: string, options?: Options): Promise<boolean>;

  /**
   * Delete all entries
   *
   * @param key Key for the entry
   * @param options Options for the operation
   * @returns A promise of the number of entries deleted
   */
  deleteAll(options?: Options): Promise<number>;

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
   * @returns Promise<true> if an entry is set for the key, otherwise
   * Promise<false>
   */
  set(key: string, value: DataObject<T>, options?: Options): Promise<boolean>;

  /**
   * Set up ttl for an entry by key
   *
   * @param key Key for the entry
   * @param options Options for the operation
   * @returns Promise<true> if an entry is set for the key, otherwise
   * Promise<false>
   */
  expire(key: string, ttl: number, options?: Options): Promise<boolean>;

  /**
   * Get ttl for an entry by key
   *
   * @param key Key for the entry
   * @param options Options for the operation
   * @returns A promise of the TTL value
   */
  ttl?(key: string, ttl: number, options?: Options): Promise<number>;

  /**
   * Fetch all keys
   *
   * @param key Key for the entry
   * @param options Options for the operation
   * @returns A promise of an array of keys for all entries
   */
  keys?(options?: Options): Promise<string[]>;

  /**
   * Get an Iterator for matching keys
   *
   * @param filter Filter for keys
   * @param options Options for the operation
   * @returns A promise of an iterator of entries
   */
  iterateKeys?(filter?: Filter, options?: Options): Promise<Iterator<T>>;
}
