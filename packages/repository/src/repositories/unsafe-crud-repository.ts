// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  DataObject,
  Options,
  Command,
  NamedParameters,
  PositionalParameters,
  AnyObject,
} from '../common-types';
import {Entity} from '../model';
import {Filter, Where} from '../query';
import {
  CrudRepository,
  EntityCrudRepository,
  EntityRepository,
} from './repository';
import {isEntityNotFoundError} from '../errors';

/**
 * CRUD operations for a repository of entities.
 *
 * Operations affecting a single entity signal "not found" error by returning
 * `undefined`, as opposed to EntityCrudRepository that throws EntityNotFound
 * error.
 */
export interface UnsafeCrudRepository<T extends Entity, ID>
  extends EntityRepository<T, ID>,
    CrudRepository<T> {
  /**
   * Save an entity. If no id is present, create a new entity
   * @param entity Entity to be saved
   * @param options Options for the operations
   * @returns A promise resolved with the updated entity or `undefined` if `entity`
   * has ID set but there is no record with such ID in the database.
   */
  save(entity: DataObject<T>, options?: Options): Promise<T | undefined>;

  /**
   * Update an entity
   * @param entity Entity to be updated
   * @param options Options for the operations
   * @returns A promise resolved with `true` on success or `false` if there is
   * no entity with the given id.
   */
  update(entity: DataObject<T>, options?: Options): Promise<boolean>;

  /**
   * Delete an entity
   * @param entity Entity to be deleted
   * @param options Options for the operations
   * @returns A promise resolved with `true` on success or `false` if there is
   * no entity with the given id.
   */
  delete(entity: DataObject<T>, options?: Options): Promise<boolean>;

  /**
   * Find an entity by id.
   * @param id Value for the entity id
   * @param filter Additional query options. E.g. `filter.include` configures
   * which related models to fetch as part of the database query (or queries).
   * @param options Options for the operations
   * @returns A promise resolved with the entity found or `undefined` if there
   * is no entity with the given id.
   */
  findById(id: ID, filter?: Filter, options?: Options): Promise<T | undefined>;

  /**
   * Update an entity by id with property/value pairs in the data object
   * @param data Data attributes to be updated
   * @param id Value for the entity id
   * @param options Options for the operations
   * @returns A promise resolved with `true` on success or `false` if there is
   * no entity with the given id.
   */
  updateById(id: ID, data: DataObject<T>, options?: Options): Promise<boolean>;

  /**
   * Replace an entity by id
   * @param data Data attributes to be replaced
   * @param id Value for the entity id
   * @param options Options for the operations
   * @returns A promise resolved with `true` on success or `false` if there is
   * no entity with the given id.
   */
  replaceById(id: ID, data: DataObject<T>, options?: Options): Promise<boolean>;

  /**
   * Delete an entity by id
   * @param id Value for the entity id
   * @param options Options for the operations
   * @returns A promise resolved with `true` on success or `false` if there is
   * no entity with the given id.
   */
  deleteById(id: ID, options?: Options): Promise<boolean>;

  /**
   * Check if an entity exists for the given id
   * @param id Value for the entity id
   * @param options Options for the operations
   * @returns Promise<true> if an entity exists for the id, otherwise
   * Promise<false>
   */
  exists(id: ID, options?: Options): Promise<boolean>;
}

export class UnsafeCrudRepositoryImpl<T extends Entity, ID>
  implements UnsafeCrudRepository<T, ID> {
  /**
   * @param crudRepository An instance of EntityCrudRepository providing an
   * implementation of CRUD operations.
   */
  constructor(protected crudRepository: EntityCrudRepository<T, ID>) {}

  async save(entity: DataObject<T>, options?: Options): Promise<T | undefined> {
    try {
      return await this.crudRepository.save(entity, options);
    } catch (err) {
      if (isEntityNotFoundError(err)) return undefined;
      throw err;
    }
  }

  update(entity: DataObject<T>, options?: Options): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  delete(entity: DataObject<T>, options?: Options): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  findById(
    id: ID,
    filter?: Filter | undefined,
    options?: Options,
  ): Promise<T | undefined> {
    throw new Error('Method not implemented.');
  }
  updateById(id: ID, data: DataObject<T>, options?: Options): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  replaceById(
    id: ID,
    data: DataObject<T>,
    options?: Options,
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  deleteById(id: ID, options?: Options): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  exists(id: ID, options?: Options): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  execute(
    command: Command,
    parameters: NamedParameters | PositionalParameters,
    options?: Options,
  ): Promise<AnyObject> {
    throw new Error('Method not implemented.');
  }
  create(dataObject: DataObject<T>, options?: AnyObject): Promise<T> {
    throw new Error('Method not implemented.');
  }
  createAll(dataObjects: DataObject<T>[], options?: AnyObject): Promise<T[]> {
    throw new Error('Method not implemented.');
  }
  find(filter?: Filter, options?: AnyObject): Promise<T[]> {
    throw new Error('Method not implemented.');
  }
  updateAll(
    dataObject: DataObject<T>,
    where?: Where,
    options?: AnyObject,
  ): Promise<number> {
    throw new Error('Method not implemented.');
  }
  deleteAll(where?: Where, options?: AnyObject): Promise<number> {
    throw new Error('Method not implemented.');
  }
  count(where?: Where, options?: AnyObject): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
