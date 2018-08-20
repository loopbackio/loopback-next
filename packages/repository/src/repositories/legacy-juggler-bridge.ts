// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as legacy from 'loopback-datasource-juggler';

import * as assert from 'assert';
import {isPromiseLike} from '@loopback/context';
import {
  Options,
  AnyObject,
  Command,
  NamedParameters,
  PositionalParameters,
  DataObject,
} from '../common-types';
import {Entity, ModelDefinition} from '../model';
import {Filter, Where} from '../query';
import {EntityCrudRepository} from './repository';
import {
  createHasManyRepositoryFactory,
  HasManyRepositoryFactory,
} from './relation.factory';
import {HasManyDefinition} from '../decorators/relation.decorator';

export namespace juggler {
  export import DataSource = legacy.DataSource;
  export import ModelBase = legacy.ModelBase;
  export import ModelBaseClass = legacy.ModelBaseClass;
  export import PersistedModel = legacy.PersistedModel;
  export import KeyValueModel = legacy.KeyValueModel;
  export import PersistedModelClass = legacy.PersistedModelClass;
}

/**
 * This is a bridge to the legacy DAO class. The function mixes DAO methods
 * into a model class and attach it to a given data source
 * @param modelClass {} Model class
 * @param ds {DataSource} Data source
 * @returns {} The new model class with DAO (CRUD) operations
 */
export function bindModel<T extends juggler.ModelBaseClass>(
  modelClass: T,
  ds: juggler.DataSource,
): T {
  const boundModelClass = class extends modelClass {};
  boundModelClass.attachTo(ds);
  return boundModelClass;
}

/**
 * Ensure the value is a promise
 * @param p Promise or void
 */
/* tslint:disable-next-line:no-any */
export function ensurePromise<T>(p: legacy.PromiseOrVoid<T>): Promise<T> {
  if (p && isPromiseLike(p)) {
    // Juggler uses promise-like Bluebird instead of native Promise
    // implementation. We need to convert the promise returned by juggler
    // methods to proper native Promise instance.
    return Promise.resolve(p);
  } else {
    return Promise.reject(new Error('The value should be a Promise: ' + p));
  }
}

/**
 * Default implementation of CRUD repository using legacy juggler model
 * and data source
 */
export class DefaultCrudRepository<T extends Entity, ID>
  implements EntityCrudRepository<T, ID> {
  modelClass: juggler.PersistedModelClass;

  /**
   * Constructor of DefaultCrudRepository
   * @param modelClass Legacy model class
   * @param dataSource Legacy data source
   */
  constructor(
    // entityClass should have type "typeof T", but that's not supported by TSC
    public entityClass: typeof Entity & {prototype: T},
    public dataSource: juggler.DataSource,
  ) {
    const definition = entityClass.definition;
    assert(
      !!definition,
      `Entity ${entityClass.name} must have valid model definition.`,
    );

    assert(
      definition.idProperties().length > 0,
      `Entity ${entityClass.name} must have at least one id/pk property.`,
    );

    this.setupPersistedModel(definition);
  }

  // Create an internal legacy Model attached to the datasource
  private setupPersistedModel(definition: ModelDefinition) {
    const dataSource = this.dataSource;

    const model = dataSource.getModel(definition.name);
    if (model) {
      // The backing persisted model has been already defined.
      this.modelClass = model as typeof juggler.PersistedModel;
      return;
    }

    // We need to convert property definitions from PropertyDefinition
    // to plain data object because of a juggler limitation
    const properties: {[name: string]: object} = {};

    // We need to convert PropertyDefinition into the definition that
    // the juggler understands
    Object.entries(definition.properties).forEach(([key, value]) => {
      if (value.type === 'array' || value.type === Array) {
        value = Object.assign({}, value, {type: [value.itemType]});
        delete value.itemType;
      }
      properties[key] = Object.assign({}, value);
    });

    this.modelClass = dataSource.createModel<juggler.PersistedModelClass>(
      definition.name,
      properties,
      Object.assign({strict: true, strictDelete: true}, definition.settings),
    );
    this.modelClass.attachTo(dataSource);
  }

  /**
   * Function to create a constrained relation repository factory
   *
   * ```ts
   * class CustomerRepository extends DefaultCrudRepository<
   *   Customer,
   *   typeof Customer.prototype.id
   * > {
   *   public orders: HasManyRepositoryFactory<Order, typeof Customer.prototype.id>;
   *
   *   constructor(
   *     protected db: juggler.DataSource,
   *     orderRepository: EntityCrudRepository<Order, typeof Order.prototype.id>,
   *   ) {
   *     super(Customer, db);
   *     this.orders = this._createHasManyRepositoryFactoryFor(
   *       'orders',
   *       orderRepository,
   *     );
   *   }
   * }
   * ```
   *
   * @param relationName Name of the relation defined on the source model
   * @param targetRepo Target repository instance
   */
  protected _createHasManyRepositoryFactoryFor<
    Target extends Entity,
    TargetID,
    ForeignKeyType
  >(
    relationName: string,
    targetRepo: EntityCrudRepository<Target, TargetID>,
  ): HasManyRepositoryFactory<Target, ForeignKeyType> {
    const meta = this.entityClass.definition.relations[relationName];
    return createHasManyRepositoryFactory<Target, TargetID, ForeignKeyType>(
      meta as HasManyDefinition,
      targetRepo,
    );
  }

  async create(entity: DataObject<T>, options?: Options): Promise<T> {
    const model = await ensurePromise(this.modelClass.create(entity, options));
    return this.toEntity(model);
  }

  async createAll(entities: DataObject<T>[], options?: Options): Promise<T[]> {
    const models = await ensurePromise(
      this.modelClass.create(entities, options),
    );
    return this.toEntities(models);
  }

  save(entity: T, options?: Options): Promise<T | null> {
    const id = this.entityClass.getIdOf(entity);
    if (id == null) {
      return this.create(entity, options);
    } else {
      return this.replaceById(id, entity, options).then(
        result =>
          result ? (new this.entityClass(entity.toObject()) as T) : null,
      );
    }
  }

  async find(filter?: Filter, options?: Options): Promise<T[]> {
    const models = await ensurePromise(this.modelClass.find(filter, options));
    return this.toEntities(models);
  }

  async findOne(filter?: Filter, options?: Options): Promise<T | null> {
    const model = await ensurePromise(this.modelClass.findOne(filter, options));
    if (!model) return null;
    return this.toEntity(model);
  }

  async findById(id: ID, filter?: Filter, options?: Options): Promise<T> {
    const model = await ensurePromise(
      this.modelClass.findById(id, filter, options),
    );
    if (!model) {
      throw new Error(`no ${this.modelClass.name} found with id "${id}"`);
    }
    return this.toEntity(model);
  }

  update(entity: T, options?: Options): Promise<boolean> {
    return this.updateById(entity.getId(), entity, options);
  }

  delete(entity: T, options?: Options): Promise<boolean> {
    return this.deleteById(entity.getId(), options);
  }

  updateAll(
    data: DataObject<T>,
    where?: Where,
    options?: Options,
  ): Promise<number> {
    where = where || {};
    return ensurePromise(this.modelClass.updateAll(where, data, options)).then(
      result => result.count,
    );
  }

  updateById(id: ID, data: DataObject<T>, options?: Options): Promise<boolean> {
    const idProp = this.modelClass.definition.idName();
    const where = {} as Where;
    where[idProp] = id;
    return this.updateAll(data, where, options).then(count => count > 0);
  }

  replaceById(
    id: ID,
    data: DataObject<T>,
    options?: Options,
  ): Promise<boolean> {
    return ensurePromise(this.modelClass.replaceById(id, data, options)).then(
      result => !!result,
    );
  }

  deleteAll(where?: Where, options?: Options): Promise<number> {
    return ensurePromise(this.modelClass.deleteAll(where, options)).then(
      result => result.count,
    );
  }

  deleteById(id: ID, options?: Options): Promise<boolean> {
    return ensurePromise(this.modelClass.deleteById(id, options)).then(
      result => result.count > 0,
    );
  }

  count(where?: Where, options?: Options): Promise<number> {
    return ensurePromise(this.modelClass.count(where, options));
  }

  exists(id: ID, options?: Options): Promise<boolean> {
    return ensurePromise(this.modelClass.exists(id, options));
  }

  async execute(
    command: Command,
    // tslint:disable:no-any
    parameters: NamedParameters | PositionalParameters,
    options?: Options,
  ): Promise<AnyObject> {
    /* istanbul ignore next */
    throw new Error('Not implemented');
  }

  protected toEntity(model: juggler.PersistedModel): T {
    return new this.entityClass(model.toObject()) as T;
  }

  protected toEntities(models: juggler.PersistedModel[]): T[] {
    return models.map(m => this.toEntity(m));
  }
}
