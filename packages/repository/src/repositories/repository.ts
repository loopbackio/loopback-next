// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, ValueObject, Model} from '../model';
import {
  DataObject,
  Options,
  AnyObject,
  Command,
  NamedParameters,
  PositionalParameters,
  Count,
} from '../common-types';
import {DataSource} from '../datasource';
import {CrudConnector} from '../connectors';
import {Filter, Where} from '../query';
import {EntityNotFoundError} from '../errors';

// tslint:disable:no-unused-variable

export interface Repository<T extends Model> {}

export interface ExecutableRepository<T extends Model> extends Repository<T> {
  /**
   * Execute a query with the given parameter object or an array of parameters
   * @param command The query string or command object
   * @param parameters The object with name/value pairs or an array of parameter
   * values
   * @param options Options
   */
  execute(
    command: Command,
    parameters: NamedParameters | PositionalParameters,
    options?: Options,
  ): Promise<AnyObject>;
}

/**
 * Basic CRUD operations for ValueObject and Entity. No ID is required.
 */
export interface CrudRepository<T extends ValueObject | Entity>
  extends Repository<T> {
  /**
   * Create a new record
   * @param dataObject The data to be created
   * @param options Options for the operations
   * @returns A promise of record created
   */
  create(dataObject: DataObject<T>, options?: Options): Promise<T>;

  /**
   * Create all records
   * @param dataObjects An array of data to be created
   * @param options Options for the operations
   * @returns A promise of an array of records created
   */
  createAll(dataObjects: DataObject<T>[], options?: Options): Promise<T[]>;

  /**
   * Find matching records
   * @param filter Query filter
   * @param options Options for the operations
   * @returns A promise of an array of records found
   */
  find(filter?: Filter<T>, options?: Options): Promise<T[]>;

  /**
   * Updating matching records with attributes from the data object
   * @param dataObject The data to be updated
   * @param where Matching criteria
   * @param options Options for the operations
   * @returns A promise of number of records updated
   */
  updateAll(
    dataObject: DataObject<T>,
    where?: Where,
    options?: Options,
  ): Promise<Count>;

  /**
   * Delete matching records
   * @param where Matching criteria
   * @param options Options for the operations
   * @returns A promise of number of records deleted
   */
  deleteAll(where?: Where, options?: Options): Promise<Count>;

  /**
   * Count matching records
   * @param where Matching criteria
   * @param options Options for the operations
   * @returns A promise of number of records matched
   */
  count(where?: Where, options?: Options): Promise<Count>;
}

/**
 * Base interface for a repository of entities
 */
export interface EntityRepository<T extends Entity, ID>
  extends ExecutableRepository<T> {}

/**
 * CRUD operations for a repository of entities
 */
export interface EntityCrudRepository<T extends Entity, ID>
  extends EntityRepository<T, ID>,
    CrudRepository<T> {
  /**
   * Save an entity. If no id is present, create a new entity
   * @param entity Entity to be saved
   * @param options Options for the operations
   * @returns A promise that will be resolve if the operation succeeded or will
   * be rejected if the entity was not found.
   */
  save(entity: DataObject<T>, options?: Options): Promise<T>;

  /**
   * Update an entity
   * @param entity Entity to be updated
   * @param options Options for the operations
   * @returns A promise that will be resolve if the operation succeeded or will
   * be rejected if the entity was not found.
   */
  update(entity: DataObject<T>, options?: Options): Promise<void>;

  /**
   * Delete an entity
   * @param entity Entity to be deleted
   * @param options Options for the operations
   * @returns A promise that will be resolve if the operation succeeded or will
   * be rejected if the entity was not found.
   */
  delete(entity: DataObject<T>, options?: Options): Promise<void>;

  /**
   * Find an entity by id, return a rejected promise if not found.
   * @param id Value for the entity id
   * @param filter Additional query options. E.g. `filter.include` configures
   * which related models to fetch as part of the database query (or queries).
   * @param options Options for the operations
   * @returns A promise of an entity found for the id
   */
  findById(id: ID, filter?: Filter<T>, options?: Options): Promise<T>;

  /**
   * Update an entity by id with property/value pairs in the data object
   * @param data Data attributes to be updated
   * @param id Value for the entity id
   * @param options Options for the operations
   * @returns A promise that will be resolve if the operation succeeded or will
   * be rejected if the entity was not found.
   */
  updateById(id: ID, data: DataObject<T>, options?: Options): Promise<void>;

  /**
   * Replace an entity by id
   * @param data Data attributes to be replaced
   * @param id Value for the entity id
   * @param options Options for the operations
   * @returns A promise that will be resolve if the operation succeeded or will
   * be rejected if the entity was not found.
   */
  replaceById(id: ID, data: DataObject<T>, options?: Options): Promise<void>;

  /**
   * Delete an entity by id
   * @param id Value for the entity id
   * @param options Options for the operations
   * @returns A promise that will be resolve if the operation succeeded or will
   * be rejected if the entity was not found.
   */
  deleteById(id: ID, options?: Options): Promise<void>;

  /**
   * Check if an entity exists for the given id
   * @param id Value for the entity id
   * @param options Options for the operations
   * @returns Promise<true> if an entity exists for the id, otherwise
   * Promise<false>
   */
  exists(id: ID, options?: Options): Promise<boolean>;
}

/**
 * Repository implementation
 *
 * Example:
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

  constructor(
    public dataSource: DataSource,
    // model should have type "typeof T", but that's not supported by TSC
    public model: typeof Entity & {prototype: T},
  ) {
    this.connector = dataSource.connector as CrudConnector;
  }

  private toModels(data: Promise<DataObject<Entity>[]>): Promise<T[]> {
    return data.then(items => items.map(i => new this.model(i) as T));
  }

  private toModel(data: Promise<DataObject<Entity>>): Promise<T> {
    return data.then(d => new this.model(d) as T);
  }

  create(entity: DataObject<T>, options?: Options): Promise<T> {
    return this.toModel(this.connector.create(this.model, entity, options));
  }

  createAll(entities: DataObject<T>[], options?: Options): Promise<T[]> {
    return this.toModels(
      this.connector.createAll!(this.model, entities, options),
    );
  }

  async save(entity: DataObject<T>, options?: Options): Promise<T> {
    if (typeof this.connector.save === 'function') {
      return this.toModel(this.connector.save(this.model, entity, options));
    } else {
      const id = this.model.getIdOf(entity);
      if (id != null) {
        await this.replaceById(id, entity, options);
        return this.toModel(Promise.resolve(entity));
      } else {
        return this.create(entity, options);
      }
    }
  }

  find(filter?: Filter<T>, options?: Options): Promise<T[]> {
    return this.toModels(this.connector.find(this.model, filter, options));
  }

  async findById(id: ID, filter?: Filter<T>, options?: Options): Promise<T> {
    if (typeof this.connector.findById === 'function') {
      return this.toModel(this.connector.findById(this.model, id, options));
    }
    const where = this.model.buildWhereForId(id);
    const entities = await this.toModels(
      this.connector.find(this.model, {where: where}, options),
    );
    if (!entities.length) {
      throw new EntityNotFoundError(this.model, id);
    }
    return entities[0];
  }

  update(entity: DataObject<T>, options?: Options): Promise<void> {
    return this.updateById(this.model.getIdOf(entity), entity, options);
  }

  delete(entity: DataObject<T>, options?: Options): Promise<void> {
    return this.deleteById(this.model.getIdOf(entity), options);
  }

  updateAll(
    data: DataObject<T>,
    where?: Where<T>,
    options?: Options,
  ): Promise<Count> {
    return this.connector.updateAll(this.model, data, where, options);
  }

  async updateById(
    id: ID,
    data: DataObject<T>,
    options?: Options,
  ): Promise<void> {
    let success: boolean;
    if (typeof this.connector.updateById === 'function') {
      success = await this.connector.updateById(this.model, id, data, options);
    } else {
      const where = this.model.buildWhereForId(id);
      const result = await this.updateAll(data, where, options);
      success = result.count > 0;
    }
    if (!success) {
      throw new EntityNotFoundError(this.model, id);
    }
  }

  async replaceById(
    id: ID,
    data: DataObject<T>,
    options?: Options,
  ): Promise<void> {
    let success: boolean;
    if (typeof this.connector.replaceById === 'function') {
      success = await this.connector.replaceById(this.model, id, data, options);
    } else {
      // FIXME: populate inst with all properties
      // tslint:disable-next-line:no-unused-variable
      const inst = data;
      const where = this.model.buildWhereForId(id);
      const result = await this.updateAll(data, where, options);
      success = result.count > 0;
    }
    if (!success) {
      throw new EntityNotFoundError(this.model, id);
    }
  }

  deleteAll(where?: Where<T>, options?: Options): Promise<Count> {
    return this.connector.deleteAll(this.model, where, options);
  }

  async deleteById(id: ID, options?: Options): Promise<void> {
    let success: boolean;
    if (typeof this.connector.deleteById === 'function') {
      success = await this.connector.deleteById(this.model, id, options);
    } else {
      const where = this.model.buildWhereForId(id);
      const result = await this.deleteAll(where, options);
      success = result.count > 0;
    }

    if (!success) {
      throw new EntityNotFoundError(this.model, id);
    }
  }

  count(where?: Where<T>, options?: Options): Promise<Count> {
    return this.connector.count(this.model, where, options);
  }

  exists(id: ID, options?: Options): Promise<boolean> {
    if (typeof this.connector.exists === 'function') {
      return this.connector.exists(this.model, id, options);
    } else {
      const where = this.model.buildWhereForId(id);
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
