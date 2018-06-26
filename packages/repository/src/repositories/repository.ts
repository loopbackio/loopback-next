// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, ValueObject, Model} from '../model';
import {
  Class,
  DataObject,
  Options,
  AnyObject,
  Command,
  NamedParameters,
  PositionalParameters,
} from '../common-types';
import {DataSource} from '../datasource';
import {CrudConnector} from '../connectors';
import {Filter, Where} from '../query';

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
  find(filter?: Filter, options?: Options): Promise<T[]>;

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
  ): Promise<number>;

  /**
   * Delete matching records
   * @param where Matching criteria
   * @param options Options for the operations
   * @returns A promise of number of records deleted
   */
  deleteAll(where?: Where, options?: Options): Promise<number>;

  /**
   * Count matching records
   * @param where Matching criteria
   * @param options Options for the operations
   * @returns A promise of number of records matched
   */
  count(where?: Where, options?: Options): Promise<number>;
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
   * @returns A promise of an entity saved or null if the entity does not exist
   */
  save(entity: DataObject<T>, options?: Options): Promise<T | null>;

  /**
   * Update an entity
   * @param entity Entity to be updated
   * @param options Options for the operations
   * @returns Promise<true> if the entity is updated, otherwise
   * Promise<false>
   */
  update(entity: DataObject<T>, options?: Options): Promise<boolean>;

  /**
   * Delete an entity
   * @param entity Entity to be deleted
   * @param options Options for the operations
   * @returns Promise<true> if the entity is deleted, otherwise
   * Promise<false>
   */
  delete(entity: DataObject<T>, options?: Options): Promise<boolean>;

  /**
   * Find an entity by id
   * @param id Value for the entity id
   * @param options Options for the operations
   * @returns A promise of an entity found for the id
   */
  findById(id: ID, filter?: Filter, options?: Options): Promise<T>;

  /**
   * Update an entity by id with property/value pairs in the data object
   * @param data Data attributes to be updated
   * @param id Value for the entity id
   * @param options Options for the operations
   * @returns Promise<true> if the entity is updated, otherwise
   * Promise<false>
   */
  updateById(id: ID, data: DataObject<T>, options?: Options): Promise<boolean>;

  /**
   * Replace an entity by id
   * @param data Data attributes to be replaced
   * @param id Value for the entity id
   * @param options Options for the operations
   * @returns Promise<true> if an entity is replaced, otherwise
   * Promise<false>
   */
  replaceById(id: ID, data: DataObject<T>, options?: Options): Promise<boolean>;

  /**
   * Delete an entity by id
   * @param id Value for the entity id
   * @param options Options for the operations
   * @returns Promise<true> if an entity is deleted for the id, otherwise
   * Promise<false>
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

  constructor(public dataSource: DataSource, public model: Class<T>) {
    this.connector = dataSource.connector as CrudConnector;
  }

  private toModels(data: Promise<DataObject<Entity>[]>): Promise<T[]> {
    return data.then(items => items.map(i => new this.model(i)));
  }

  private toModel(data: Promise<DataObject<Entity>>): Promise<T> {
    return data.then(d => new this.model(d));
  }

  create(entity: DataObject<T>, options?: Options): Promise<T> {
    return this.toModel(this.connector.create(this.model, entity, options));
  }

  createAll(entities: DataObject<T>[], options?: Options): Promise<T[]> {
    return this.toModels(
      this.connector.createAll!(this.model, entities, options),
    );
  }

  save(entity: DataObject<T>, options?: Options): Promise<T | null> {
    if (typeof this.connector.save === 'function') {
      return this.toModel(this.connector.save(this.model, entity, options));
    } else {
      const id = this.model.getIdOf(entity);
      if (id != null) {
        return this.replaceById(id, entity, options).then(
          (result: boolean) =>
            result
              ? this.toModel(Promise.resolve(entity))
              : Promise.reject(new Error('Not found')),
        );
      } else {
        return this.create(entity, options);
      }
    }
  }

  find(filter?: Filter, options?: Options): Promise<T[]> {
    return this.toModels(this.connector.find(this.model, filter, options));
  }

  findById(id: ID, options?: Options): Promise<T> {
    if (typeof this.connector.findById === 'function') {
      return this.toModel(this.connector.findById(this.model, id, options));
    }
    const where = this.model.buildWhereForId(id);
    return this.connector
      .find(this.model, {where: where}, options)
      .then((entities: T[]) => {
        return entities[0];
      });
  }

  update(entity: DataObject<T>, options?: Options): Promise<boolean> {
    return this.updateById(this.model.getIdOf(entity), entity, options);
  }

  delete(entity: DataObject<T>, options?: Options): Promise<boolean> {
    return this.deleteById(this.model.getIdOf(entity), options);
  }

  updateAll(
    data: DataObject<T>,
    where?: Where,
    options?: Options,
  ): Promise<number> {
    return this.connector.updateAll(this.model, data, where, options);
  }

  updateById(id: ID, data: DataObject<T>, options?: Options): Promise<boolean> {
    if (typeof this.connector.updateById === 'function') {
      return this.connector.updateById(this.model, id, data, options);
    }
    const where = this.model.buildWhereForId(id);
    return this.updateAll(data, where, options).then(
      (count: number) => count > 0,
    );
  }

  replaceById(
    id: ID,
    data: DataObject<T>,
    options?: Options,
  ): Promise<boolean> {
    if (typeof this.connector.replaceById === 'function') {
      return this.connector.replaceById(this.model, id, data, options);
    }
    // FIXME: populate inst with all properties
    // tslint:disable-next-line:no-unused-variable
    const inst = data;
    const where = this.model.buildWhereForId(id);
    return this.updateAll(data, where, options).then(
      (count: number) => count > 0,
    );
  }

  deleteAll(where?: Where, options?: Options): Promise<number> {
    return this.connector.deleteAll(this.model, where, options);
  }

  deleteById(id: ID, options?: Options): Promise<boolean> {
    if (typeof this.connector.deleteById === 'function') {
      return this.connector.deleteById(this.model, id, options);
    } else {
      const where = this.model.buildWhereForId(id);
      return this.deleteAll(where, options).then((count: number) => count > 0);
    }
  }

  count(where?: Where, options?: Options): Promise<number> {
    return this.connector.count(this.model, where, options);
  }

  exists(id: ID, options?: Options): Promise<boolean> {
    if (typeof this.connector.exists === 'function') {
      return this.connector.exists(this.model, id, options);
    } else {
      const where = this.model.buildWhereForId(id);
      return this.count(where, options).then(result => result > 0);
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
