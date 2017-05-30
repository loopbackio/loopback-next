// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Repository} from './repository';
import {Options} from './common';
import {Model} from './model';
import {Class, ObjectType} from './common';
import {Filter} from './query';

/**
 * Key/Value operations for connector implementations
 */
export interface KVRepository<T extends Model> extends Repository<T> {
  /**
   * Delete an entry by key
   *
   * @param key
   * @param options
   */
  delete(key: string, options?: Options): Promise<boolean>;

  /**
   * Delete all entries
   *
   * @param key
   * @param options
   */
  deleteAll(options?: Options): Promise<number>;

  /**
   * Get an entry by key
   *
   * @param key
   * @param options
   */
  get(key: string, options?: Options): Promise<T>;

  /**
   * Set an entry with key/value
   *
   * @param key
   * @param options
   */
  set(key: string, value: ObjectType<T>, options?: Options): Promise<boolean>;

  /**
   * Set up ttl for an entry by key
   *
   * @param key
   * @param options
   */
  expire(key: string, ttl: number, options?: Options): Promise<boolean>;

  /**
   * Get ttl for an entry by key
   *
   * @param key
   * @param options
   */
  ttl?(key: string, ttl: number, options?: Options): Promise<number>;

  /**
   * Fetch all keys
   *
   * @param key
   * @param options
   */
  keys?(options?: Options): Promise<string[]>;

  /**
   * Get an Iterator for matching keys
   *
   * @param filter
   * @param options
   */
  iterateKeys?(filter?: Filter, options?: Options): Promise<Iterator<T>>;
}
