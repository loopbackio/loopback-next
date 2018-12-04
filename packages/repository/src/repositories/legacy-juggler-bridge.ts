// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, isPromiseLike} from '@loopback/context';
import * as assert from 'assert';
import * as legacy from 'loopback-datasource-juggler';
import {
  AnyObject,
  Command,
  Count,
  DataObject,
  NamedParameters,
  Options,
  PositionalParameters,
} from '../common-types';
import {EntityNotFoundError} from '../errors';
import {Entity, ModelDefinition} from '../model';
import {Filter, Where} from '../query';
import {
  BelongsToDefinition,
  HasManyDefinition,
  HasManyRepositoryFactory,
  createHasManyRepositoryFactory,
  BelongsToAccessor,
  createBelongsToAccessor,
  createHasOneRepositoryFactory,
  HasOneDefinition,
  HasOneRepositoryFactory,
} from '../relations';
import {resolveType} from '../type-resolver';
import {EntityCrudRepository} from './repository';

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
   * @param entityClass Legacy entity class
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
        value = Object.assign({}, value, {type: [resolveType(value.itemType)]});
        delete value.itemType;
      }
      value.type = resolveType(value.type);
      properties[key] = Object.assign({}, value);
    });

    this.modelClass = dataSource.createModel<juggler.PersistedModelClass>(
      definition.name,
      properties,
      Object.assign(
        // settings that users can override
        {strict: true},
        // user-defined settings
        definition.settings,
        // settings enforced by the framework
        {strictDelete: false},
      ),
    );
    this.modelClass.attachTo(dataSource);
  }

  /**
   * @deprecated
   * Function to create a constrained relation repository factory
   *
   * Use `this.createHasManyRepositoryFactoryFor()` instaed
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
    targetRepoGetter: Getter<EntityCrudRepository<Target, TargetID>>,
  ): HasManyRepositoryFactory<Target, ForeignKeyType> {
    return this.createHasManyRepositoryFactoryFor(
      relationName,
      targetRepoGetter,
    );
  }

  /**
   * Function to create a constrained relation repository factory
   *
   * ```ts
   * class CustomerRepository extends DefaultCrudRepository<
   *   Customer,
   *   typeof Customer.prototype.id
   * > {
   *   public readonly orders: HasManyRepositoryFactory<Order, typeof Customer.prototype.id>;
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
  protected createHasManyRepositoryFactoryFor<
    Target extends Entity,
    TargetID,
    ForeignKeyType
  >(
    relationName: string,
    targetRepoGetter: Getter<EntityCrudRepository<Target, TargetID>>,
  ): HasManyRepositoryFactory<Target, ForeignKeyType> {
    const meta = this.entityClass.definition.relations[relationName];
    return createHasManyRepositoryFactory<Target, TargetID, ForeignKeyType>(
      meta as HasManyDefinition,
      targetRepoGetter,
    );
  }

  /**
   * @deprecated
   * Function to create a belongs to accessor
   *
   * Use `this.createBelongsToAccessorFor()` instaed
   *
   * @param relationName Name of the relation defined on the source model
   * @param targetRepo Target repository instance
   */
  protected _createBelongsToAccessorFor<Target extends Entity, TargetId>(
    relationName: string,
    targetRepoGetter: Getter<EntityCrudRepository<Target, TargetId>>,
  ): BelongsToAccessor<Target, ID> {
    return this.createBelongsToAccessorFor(relationName, targetRepoGetter);
  }

  /**
   * Function to create a belongs to accessor
   *
   * @param relationName Name of the relation defined on the source model
   * @param targetRepo Target repository instance
   */
  protected createBelongsToAccessorFor<Target extends Entity, TargetId>(
    relationName: string,
    targetRepoGetter: Getter<EntityCrudRepository<Target, TargetId>>,
  ): BelongsToAccessor<Target, ID> {
    const meta = this.entityClass.definition.relations[relationName];
    return createBelongsToAccessor<Target, TargetId, T, ID>(
      meta as BelongsToDefinition,
      targetRepoGetter,
      this,
    );
  }

  protected _createHasOneRepositoryFactoryFor<
    Target extends Entity,
    TargetID,
    ForeignKeyType
  >(
    relationName: string,
    targetRepoGetter: Getter<EntityCrudRepository<Target, TargetID>>,
  ): HasOneRepositoryFactory<Target, ForeignKeyType> {
    const meta = this.entityClass.definition.relations[relationName];
    return createHasOneRepositoryFactory<Target, TargetID, ForeignKeyType>(
      meta as HasOneDefinition,
      targetRepoGetter,
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

  async save(entity: T, options?: Options): Promise<T> {
    const id = this.entityClass.getIdOf(entity);
    if (id == null) {
      return this.create(entity, options);
    } else {
      await this.replaceById(id, entity, options);
      return new this.entityClass(entity.toObject()) as T;
    }
  }

  async find(filter?: Filter<T>, options?: Options): Promise<T[]> {
    const models = await ensurePromise(
      this.modelClass.find(filter as legacy.Filter, options),
    );
    return this.toEntities(models);
  }

  async findOne(filter?: Filter<T>, options?: Options): Promise<T | null> {
    const model = await ensurePromise(
      this.modelClass.findOne(filter as legacy.Filter, options),
    );
    if (!model) return null;
    return this.toEntity(model);
  }

  async findById(id: ID, filter?: Filter<T>, options?: Options): Promise<T> {
    const model = await ensurePromise(
      this.modelClass.findById(id, filter as legacy.Filter, options),
    );
    if (!model) {
      throw new EntityNotFoundError(this.entityClass, id);
    }
    return this.toEntity(model);
  }

  update(entity: T, options?: Options): Promise<void> {
    return this.updateById(entity.getId(), entity, options);
  }

  delete(entity: T, options?: Options): Promise<void> {
    return this.deleteById(entity.getId(), options);
  }

  async updateAll(
    data: DataObject<T>,
    where?: Where<T>,
    options?: Options,
  ): Promise<Count> {
    where = where || {};
    const result = await ensurePromise(
      this.modelClass.updateAll(where, data, options),
    );
    return {count: result.count};
  }

  async updateById(
    id: ID,
    data: DataObject<T>,
    options?: Options,
  ): Promise<void> {
    const idProp = this.modelClass.definition.idName();
    const where = {} as Where<T>;
    (where as AnyObject)[idProp] = id;
    const result = await this.updateAll(data, where, options);
    if (result.count === 0) {
      throw new EntityNotFoundError(this.entityClass, id);
    }
  }

  async replaceById(
    id: ID,
    data: DataObject<T>,
    options?: Options,
  ): Promise<void> {
    try {
      await ensurePromise(this.modelClass.replaceById(id, data, options));
    } catch (err) {
      if (err.statusCode === 404) {
        throw new EntityNotFoundError(this.entityClass, id);
      }
      throw err;
    }
  }

  async deleteAll(where?: Where<T>, options?: Options): Promise<Count> {
    const result = await ensurePromise(
      this.modelClass.deleteAll(where, options),
    );
    return {count: result.count};
  }

  async deleteById(id: ID, options?: Options): Promise<void> {
    const result = await ensurePromise(this.modelClass.deleteById(id, options));
    if (result.count === 0) {
      throw new EntityNotFoundError(this.entityClass, id);
    }
  }

  async count(where?: Where<T>, options?: Options): Promise<Count> {
    const result = await ensurePromise(this.modelClass.count(where, options));
    return {count: result};
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
