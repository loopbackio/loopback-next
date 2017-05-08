import {Entity, Model} from './model';
import {Class, ObjectType, AnyObject, Options} from './common';
import {DataSource} from './datasource';
import {CrudConnector, EntityData} from './crud-connector';
import {Fields, Filter, Where, Operators, Inclusion} from './query';

export interface Repository<T extends Model> {
}

/**
 * Basic CRUD operations for value objects (without IDs)
 */
export interface ValueObjectRepository<T extends Model> extends Repository<T> {
  /**
   * Create a new record
   * @param value
   * @param options
   */
  create(value: ObjectType<T>, options?: Options): Promise<T>;

  /**
   * Find matching records
   * @param filter
   * @param options
   */
  find(filter?: Filter, options?: Options): Promise<T[]>;

  /**
   * Updating matching records with attributes from the data object
   * @param data
   * @param where
   * @param options
   */
  updateAll(data: ObjectType<T>, where?: Where, options?: Options): Promise<number>;

  /**
   * Delete matching records
   * @param where
   * @param options
   */
  deleteAll(where?: Where, options?: Options): Promise<number>;

  /**
   * Count matching records
   * @param where
   * @param options
   */
  count(where?: Where, options?: Options): Promise<number>;
}

/**
 * Base interface for a repository
 */
export interface EntityRepository<T extends Entity, ID> extends Repository<T> {
}

/**
 * CRUD repository
 */
export interface EntityCrudRepository<T extends Entity, ID>
extends EntityRepository<T, ID> {
  /**
   * Create an entity
   * @param entity
   * @param options
   */
  create(entity: ObjectType<T>, options?: Options): Promise<T>;

  /**
   * Create all entities
   * @param entities
   * @param options
   */
  createAll(entities: ObjectType<T>[], options?: Options): Promise<T[]>;

  /**
   *
   * @param entity
   * @param options
   */
  save(entity: ObjectType<T>, options?: Options): Promise<T>;

  /**
   *
   * @param filter
   * @param options
   */
  find(filter?: Filter, options?: Options): Promise<T[]>;

  /**
   *
   * @param id
   * @param options
   */
  findById(id: ID, options?: Options): Promise<T>;

  /**
   *
   * @param entity
   * @param options
   */
  update(entity: ObjectType<T>, options?: Options): Promise<boolean>;

  /**
   *
   * @param entity
   * @param options
   */
  delete(entity: ObjectType<T>, options?: Options): Promise<boolean>;

  /**
   *
   * @param data
   * @param where
   * @param options
   */
  updateAll(data: ObjectType<T>, where?: Where, options?: Options): Promise<number>;

  /**
   *
   * @param data
   * @param id
   * @param options
   */
  updateById(id: ID, data: ObjectType<T>, options?: Options): Promise<boolean>;

  /**
   *
   * @param data
   * @param id
   * @param options
   */
  replaceById(id: ID, data: ObjectType<T>, options?: Options): Promise<boolean>;

  /**
   *
   * @param where
   * @param options
   */
  deleteAll(where?: Where, options?: Options): Promise<number>;

  /**
   *
   * @param id
   * @param options
   */
  deleteById(id: ID, options?: Options): Promise<boolean>;

  /**
   * Count the matching records
   * @param where
   * @param options
   */
  count(where?: Where, options?: Options): Promise<number>;
}

/**
 * Repository implementation
 */
export class CrudRepositoryImpl<T extends Entity, ID>
implements EntityCrudRepository<T, ID> {
  private connector: CrudConnector;

  constructor(public dataSource: DataSource, public model: Class<T>) {
    this.connector = dataSource.connector as CrudConnector;
  }

  create(entity: ObjectType<T>, options?: Options): Promise<T> {
    return this.connector.create(this.model, entity, options);
  }

  createAll(entities: ObjectType<T>[], options?: Options): Promise<T[]> {
    return this.connector.create(this.model, entities, options);
  }

  save(entity: ObjectType<T>, options?: Options): Promise<T> {
    if (typeof this.connector.save === 'function') {
      return this.connector.save(this.model, entity, options);
    } else {
      if(entity.getId() != null) {
        return this.replaceById(entity.getId(), entity, options).
        then((result: boolean) => result? Promise.resolve(entity):
        Promise.reject(new Error('Not found')));
      } else {
        return this.create(entity, options);
      }
    }
  }

  find(filter?: Filter, options?: Options): Promise<T[]> {
    return this.connector.find(this.model, filter, options);
  }

  findById(id: ID, options?: Options): Promise<T> {
    if (typeof this.connector.findById === 'function') {
      return this.connector.findById(this.model, id, options);
    }
    return this.connector.find(this.model, {where: {id: id}}, options).
    then((entities: T[]) => {
      return entities[0];
    });
  }

  update(entity: ObjectType<T>, options?: Options): Promise<boolean> {
    return this.updateById(entity.getId(), entity, options);
  }

  delete(entity: ObjectType<T>, options?: Options): Promise<boolean> {
    return this.deleteById(entity.getId(), options);
  }

  updateAll(data: ObjectType<T>, where?: Where, options?: Options): Promise<number> {
    return this.connector.updateAll(this.model, data, where, options);
  }

  updateById(id: ID, data: ObjectType<T>, options?: Options): Promise<boolean> {
    if (typeof this.connector.updateById === 'function') {
      return this.connector.updateById(this.model, id, data, options);
    }
    return this.updateAll(data, {id: id}, options).
      then((count:number) => count > 0);
  }

  replaceById(id: ID, data: ObjectType<T>, options?: Options): Promise<boolean> {
    if (typeof this.connector.replaceById === 'function') {
      return this.connector.replaceById(this.model, id, data, options);
    }
    // FIXME: populate inst with all properties
    let inst = data;
    return this.updateAll(data, {id: id}, options).
      then((count:number) => count > 0);
  }

  deleteAll(where?: Where, options?: Options): Promise<number> {
    return this.connector.deleteAll(this.model, where, options);
  }

  deleteById(id: ID, options?: Options): Promise<boolean> {
    if (typeof this.connector.deleteById === 'function') {
      return this.connector.deleteById(this.model, id, options);
    } else {
      let where = {} as AnyObject;
      where[this.model.definition] = id;
      return this.deleteAll({}, options).
        then((count:number) => count > 0);;
    }
  }

  count(where?: Where, options?: Options): Promise<number> {
    return this.connector.count(this.model, where, options);
  }
}
