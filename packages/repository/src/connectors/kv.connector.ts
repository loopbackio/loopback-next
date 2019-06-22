// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Connector} from './connector';
import {Entity, EntityData} from '../model';
import {Class, Options} from '../common-types';
import {Filter} from '../query';

/**
 * Key/Value operations for connector implementations
 */
export interface KVConnector<T extends Entity> extends Connector {
  /**
   * Delete an entry by key
   * @param modelClass - Model class
   * @param key - Key for the entry
   * @param options - Options for the operation
   * @returns Promise<true> if an entry is deleted for the id, otherwise
   * Promise<false>
   */
  delete(
    modelClass: Class<Entity>,
    key: string,
    options?: Options,
  ): Promise<boolean>;

  /**
   * Delete all entries
   * @param modelClass - Model class
   * @param options - Options for the operation
   * @returns A promise of the number of entries deleted
   */
  deleteAll(modelClass: Class<Entity>, options?: Options): Promise<number>;

  /**
   * Get an entry by key
   * @param modelClass - Model class
   * @param key - Key for the entry
   * @param options - Options for the operation
   * @returns A promise of the entry found for the key
   */
  get(modelClass: Class<Entity>, key: string, options?: Options): Promise<T>;

  /**
   * Set an entry with key/value
   * @param modelClass - Model class
   * @param key - Key for the entry
   * @param value - Value for the entry
   * @param options - Options for the operation
   * @returns Promise<true> if an entry is set for the key, otherwise
   * Promise<false>
   */
  set(
    modelClass: Class<Entity>,
    key: string,
    value: EntityData,
    options?: Options,
  ): Promise<boolean>;

  /**
   * Set up ttl for an entry by key
   * @param modelClass - Model class
   * @param key - Key for the entry
   * @param options - Options for the operation
   * @returns Promise<true> if an entry is configured for the key, otherwise
   * Promise<false>
   */
  expire(
    modelClass: Class<Entity>,
    key: string,
    ttl: number,
    options?: Options,
  ): Promise<boolean>;

  /**
   * Get ttl for an entry by key
   * @param modelClass - Model class
   * @param key - Key for the entry
   * @param ttl - Time to live in millisenconds
   * @param options - Options for the operation
   * @returns A promise of the TTL value
   */
  ttl?(
    modelClass: Class<Entity>,
    key: string,
    ttl: number,
    options?: Options,
  ): Promise<number>;

  /**
   * Fetch all keys
   * @param modelClass - Model class
   * @param key - Key for the entry
   * @param options - Options for the operation
   * @returns A promise of an array of keys for all entries
   */
  keys?(modelClass: Class<Entity>, options?: Options): Promise<string[]>;

  /**
   * Get an Iterator for matching keys
   * @param modelClass - Model class
   * @param filter - Matching filter
   * @param options - Options for the operation
   * @returns A promise of an iterator of entries
   */
  iterateKeys?(
    modelClass: Class<Entity>,
    filter?: Filter,
    options?: Options,
  ): Promise<Iterator<T>>;
}
