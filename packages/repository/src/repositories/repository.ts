// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  AnyObject,
  Command,
  Count,
  DataObject,
  NamedParameters,
  Options,
  PositionalParameters,
} from '../common-types';
import {CrudConnector} from '../connectors';
import {DataSource} from '../datasource';
import {EntityNotFoundError} from '../errors';
import {Entity, Model, ValueObject} from '../model';
import {Filter, Where} from '../query';
import {InclusionResolver} from '../relations/relation.types';
import {IsolationLevel, Transaction} from '../transaction';

/* eslint-disable @typescript-eslint/no-unused-vars */

export interface Repository<T extends Model> {}

export interface ExecutableRepository<T extends Model> extends Repository<T> {
  /**
   * Execute a query with the given parameter object or an array of parameters
   * @param command - The query string or command object
   * @param parameters - The object with name/value pairs or an array of parameter
   * values
   * @param options - Options
   */
  execute(
    command: Command,
    parameters: NamedParameters | PositionalParameters,
    options?: Options,
  ): Promise<AnyObject>;
}

/**
 * A type for CRUD repositories that are backed by IDs and support
 * Transactions
 */
export type TransactionalEntityRepository<
  T extends Entity,
  ID,
  Relations extends object = {}
> = TransactionalRepository<T> & EntityCrudRepository<T, ID>;
/**
 * Repository Interface for Repositories that support Transactions
 *
 * @typeParam T Generic type for the Entity
 */
export interface TransactionalRepository<T extends Entity>
  extends Repository<T> {
  /**
   * Begin a new Transaction
   * @param options - Options for the operations
   * @returns Promise<Transaction> Promise that resolves to a new Transaction
   * object
   */
  beginTransaction(options?: IsolationLevel | Options): Promise<Transaction>;
}

/**
 * Basic CRUD operations for ValueObject and Entity. No ID is required.
 */
export interface CrudRepository<
  T extends ValueObject | Entity,
  Relations extends object = {}
> extends Repository<T> {
  /**
   * Create a new record
   * @param dataObject - The data to be created
   * @param options - Options for the operations
   * @returns A promise of record created
   */
  create(dataObject: DataObject<T>, options?: Options): Promise<T>;

  /**
   * Create all records
   * @param dataObjects - An array of data to be created
   * @param options - Options for the operations
   * @returns A promise of an array of records created
   */
  createAll(dataObjects: DataObject<T>[], options?: Options): Promise<T[]>;

  /**
   * Find matching records
   * @param filter - Query filter
   * @param options - Options for the operations
   * @returns A promise of an array of records found
   */
  find(filter?: Filter<T>, options?: Options): Promise<(T & Relations)[]>;

  /**
   * Updating matching records with attributes from the data object
   * @param dataObject - The data to be updated
   * @param where - Matching criteria
   * @param options - Options for the operations
   * @returns A promise of number of records updated
   */
  updateAll(
    dataObject: DataObject<T>,
    where?: Where<T>,
    options?: Options,
  ): Promise<Count>;

  /**
   * Delete matching records
   * @param where - Matching criteria
   * @param options - Options for the operations
   * @returns A promise of number of records deleted
   */
  deleteAll(where?: Where<T>, options?: Options): Promise<Count>;

  /**
   * Count matching records
   * @param where - Matching criteria
   * @param options - Options for the operations
   * @returns A promise of number of records matched
   */
  count(where?: Where<T>, options?: Options): Promise<Count>;
}

/**
 * Base interface for a repository of entities
 */
export interface EntityRepository<T extends Entity, ID>
  extends ExecutableRepository<T> {}

/**
 * CRUD operations for a repository of entities
 */
export interface EntityCrudRepository<
  T extends Entity,
  ID,
  Relations extends object = {}
> extends EntityRepository<T, ID>, CrudRepository<T, Relations> {
  // entityClass should have type "typeof T", but that's not supported by TSC
  entityClass: typeof Entity & {prototype: T};
  inclusionResolvers: Map<string, InclusionResolver<T, Entity>>;

  /**
   * Save an entity. If no id is present, create a new entity
   * @param entity - Entity to be saved
   * @param options - Options for the operations
   * @returns A promise that will be resolve if the operation succeeded or will
   * be rejected if the entity was not found.
   */
  save(entity: DataObject<T>, options?: Options): Promise<T>;

  /**
   * Update an entity
   * @param entity - Entity to be updated
   * @param options - Options for the operations
   * @returns A promise that will be resolve if the operation succeeded or will
   * be rejected if the entity was not found.
   */
  update(entity: DataObject<T>, options?: Options): Promise<void>;

  /**
   * Delete an entity
   * @param entity - Entity to be deleted
   * @param options - Options for the operations
   * @returns A promise that will be resolve if the operation succeeded or will
   * be rejected if the entity was not found.
   */
  delete(entity: DataObject<T>, options?: Options): Promise<void>;

  /**
   * Find an entity by id, return a rejected promise if not found.
   * @param id - Value for the entity id
   * @param filter - Additional query options. E.g. `filter.include` configures
   * which related models to fetch as part of the database query (or queries).
   * @param options - Options for the operations
   * @returns A promise of an entity found for the id
   */
  findById(
    id: ID,
    filter?: Filter<T>,
    options?: Options,
  ): Promise<T & Relations>;

  /**
   * Update an entity by id with property/value pairs in the data object
   * @param id - Value for the entity id
   * @param data - Data attributes to be updated
   * @param options - Options for the operations
   * @returns A promise that will be resolve if the operation succeeded or will
   * be rejected if the entity was not found.
   */
  updateById(id: ID, data: DataObject<T>, options?: Options): Promise<void>;

  /**
   * Replace an entity by id
   * @param id - Value for the entity id
   * @param data - Data attributes to be replaced
   * @param options - Options for the operations
   * @returns A promise that will be resolve if the operation succeeded or will
   * be rejected if the entity was not found.
   */
  replaceById(id: ID, data: DataObject<T>, options?: Options): Promise<void>;

  /**
   * Delete an entity by id
   * @param id - Value for the entity id
   * @param options - Options for the operations
   * @returns A promise that will be resolve if the operation succeeded or will
   * be rejected if the entity was not found.
   */
  deleteById(id: ID, options?: Options): Promise<void>;

  /**
   * Check if an entity exists for the given id
   * @param id - Value for the entity id
   * @param options - Options for the operations
   * @returns Promise<true> if an entity exists for the id, otherwise
   * Promise<false>
   */
  exists(id: ID, options?: Options): Promise<boolean>;
}

/**
 * Repository implementation
 *
 * @example
 *
 * User can import `CrudRepositoryImpl` and call its functions like:
 * `CrudRepositoryImpl.find(somefilters, someoptions)`
 *
 * Or extend class `CrudRepositoryImpl` and override its functions:
 * ```ts
 * export class TestRepository extends CrudRepositoryImpl<Test> {
 *   constructor(dataSource: DataSource, model: Test) {
 *     super(dataSource, Customer);
 *   }
 *
 *   // Override `deleteAll` to disable the operation
 *   deleteAll(where?: Where, options?: Options) {
 *     return Promise.reject(new Error('deleteAll is disabled'));
 *   }
 * }
 * ```
 */
export class CrudRepositoryImpl<T extends Entity, ID>
  implements EntityCrudRepository<T, ID> {
  private connector: CrudConnector;
  public readonly inclusionResolvers: Map<
    string,
    InclusionResolver<T, Entity>
  > = new Map();

  constructor(
    public dataSource: DataSource,
    // model should have type "typeof T", but that's not supported by TSC
    public entityClass: typeof Entity & {prototype: T},
  ) {
    this.connector = dataSource.connector as CrudConnector;
  }

  private toModels(data: Promise<DataObject<Entity>[]>): Promise<T[]> {
    return data.then(items => items.map(i => new this.entityClass(i) as T));
  }

  private toModel(data: Promise<DataObject<Entity>>): Promise<T> {
    return data.then(d => new this.entityClass(d) as T);
  }

  create(entity: DataObject<T>, options?: Options): Promise<T> {
    return this.toModel(
      this.connector.create(this.entityClass, entity, options),
    );
  }

  createAll(entities: DataObject<T>[], options?: Options): Promise<T[]> {
    return this.toModels(
      this.connector.createAll!(this.entityClass, entities, options),
    );
  }

  async save(entity: DataObject<T>, options?: Options): Promise<T> {
    if (typeof this.connector.save === 'function') {
      return this.toModel(
        this.connector.save(this.entityClass, entity, options),
      );
    } else {
      const id = this.entityClass.getIdOf(entity);
      if (id != null) {
        await this.replaceById(id, entity, options);
        return this.toModel(Promise.resolve(entity));
      } else {
        return this.create(entity, options);
      }
    }
  }

  find(filter?: Filter<T>, options?: Options): Promise<T[]> {
    return this.toModels(
      this.connector.find(this.entityClass, filter, options),
    );
  }

  async findById(id: ID, filter?: Filter<T>, options?: Options): Promise<T> {
    if (typeof this.connector.findById === 'function') {
      return this.toModel(
        this.connector.findById(this.entityClass, id, options),
      );
    }
    const where = this.entityClass.buildWhereForId(id);
    const entities = await this.toModels(
      this.connector.find(this.entityClass, {where: where}, options),
    );
    if (!entities.length) {
      throw new EntityNotFoundError(this.entityClass, id);
    }
    return entities[0];
  }

  update(entity: DataObject<T>, options?: Options): Promise<void> {
    return this.updateById(this.entityClass.getIdOf(entity), entity, options);
  }

  delete(entity: DataObject<T>, options?: Options): Promise<void> {
    return this.deleteById(this.entityClass.getIdOf(entity), options);
  }

  updateAll(
    data: DataObject<T>,
    where?: Where<T>,
    options?: Options,
  ): Promise<Count> {
    return this.connector.updateAll(this.entityClass, data, where, options);
  }

  async updateById(
    id: ID,
    data: DataObject<T>,
    options?: Options,
  ): Promise<void> {
    let success: boolean;
    if (typeof this.connector.updateById === 'function') {
      success = await this.connector.updateById(
        this.entityClass,
        id,
        data,
        options,
      );
    } else {
      const where = this.entityClass.buildWhereForId(id);
      const result = await this.updateAll(data, where, options);
      success = result.count > 0;
    }
    if (!success) {
      throw new EntityNotFoundError(this.entityClass, id);
    }
  }

  async replaceById(
    id: ID,
    data: DataObject<T>,
    options?: Options,
  ): Promise<void> {
    let success: boolean;
    if (typeof this.connector.replaceById === 'function') {
      success = await this.connector.replaceById(
        this.entityClass,
        id,
        data,
        options,
      );
    } else {
      // FIXME: populate inst with all properties
      const inst = data;
      const where = this.entityClass.buildWhereForId(id);
      const result = await this.updateAll(data, where, options);
      success = result.count > 0;
    }
    if (!success) {
      throw new EntityNotFoundError(this.entityClass, id);
    }
  }

  deleteAll(where?: Where<T>, options?: Options): Promise<Count> {
    return this.connector.deleteAll(this.entityClass, where, options);
  }

  async deleteById(id: ID, options?: Options): Promise<void> {
    let success: boolean;
    if (typeof this.connector.deleteById === 'function') {
      success = await this.connector.deleteById(this.entityClass, id, options);
    } else {
      const where = this.entityClass.buildWhereForId(id);
      const result = await this.deleteAll(where, options);
      success = result.count > 0;
    }

    if (!success) {
      throw new EntityNotFoundError(this.entityClass, id);
    }
  }

  count(where?: Where<T>, options?: Options): Promise<Count> {
    return this.connector.count(this.entityClass, where, options);
  }

  exists(id: ID, options?: Options): Promise<boolean> {
    if (typeof this.connector.exists === 'function') {
      return this.connector.exists(this.entityClass, id, options);
    } else {
      const where = this.entityClass.buildWhereForId(id);
      return this.count(where, options).then(result => result.count > 0);
    }
  }

  execute(
    command: Command,
    parameters: NamedParameters | PositionalParameters,
    options?: Options,
  ): Promise<AnyObject> {
    if (typeof this.connector.execute !== 'function') {
      throw new Error('Not implemented');
    }
    return this.connector.execute(command, parameters, options);
  }
}
