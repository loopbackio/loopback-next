import {Connector} from './connector';
import {Options} from './common';
import {Entity} from './model';
import {Class, ObjectType} from './common';
import {Filter} from './query';

export type EntityData = ObjectType<Entity>;

/**
 * Key/Value operations for connector implementations
 */
export interface KVConnector<T extends Entity> extends Connector {
  /**
   * Delete an entry by key
   * @param modelClass
   * @param key 
   * @param options
   */
  delete(modelClass: Class<Entity>, key: string, options?: Options):
    Promise<number>;
  
  /**
   * Delete all entries
   * @param modelClass
   * @param key 
   * @param options
   */
  deleteAll(modelClass: Class<Entity>, options?: Options):
    Promise<number>;

  /**
   * Get an entry by key
   * @param modelClass
   * @param key 
   * @param options
   */
  get(modelClass: Class<Entity>, key: string, options?: Options):
    Promise<T>;

  /**
   * Set an entry with key/value
   * @param modelClass
   * @param key 
   * @param options
   */
  set(modelClass: Class<Entity>, key: string, value: EntityData,
    options?: Options): Promise<boolean>;

  /**
   * Set up ttl for an entry by key
   * @param modelClass
   * @param key 
   * @param options
   */
  expire(modelClass: Class<Entity>, key: string, ttl: number,
    options?: Options): Promise<boolean>;

  /**
   * Get ttl for an entry by key
   * @param modelClass
   * @param key 
   * @param options
   */
  ttl?(modelClass: Class<Entity>, key: string, ttl: number,
    options?: Options): Promise<number>;

  /**
   * Fetch all keys
   * @param modelClass
   * @param key 
   * @param options
   */
  keys?(modelClass: Class<Entity>, options?: Options): Promise<string[]>;

  /**
   * Get an Iterator for matching keys
   * @param modelClass
   * @param filter
   * @param options
   */
  iterateKeys?(modelClass: Class<Entity>, filter?: Filter, options?: Options): Promise<Iterator<T>>;
}
