// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/core';
import {
  Filter,
  FilterExcludingWhere,
  InclusionFilter,
  Where,
} from '@loopback/filter';
import assert from 'assert';
import legacy from 'loopback-datasource-juggler';
import {
  AnyObject,
  Command,
  Count,
  DataObject,
  DeepPartial,
  NamedParameters,
  Options,
  PositionalParameters,
} from '../common-types';
import {EntityNotFoundError} from '../errors';
import {
  Entity,
  Model,
  PropertyType,
  rejectNavigationalPropertiesInData,
} from '../model';
import {
  BelongsToAccessor,
  BelongsToDefinition,
  createBelongsToAccessor,
  createHasManyRepositoryFactory,
  createHasManyThroughRepositoryFactory,
  createHasOneRepositoryFactory,
  HasManyDefinition,
  HasManyRepositoryFactory,
  HasManyThroughRepositoryFactory,
  HasOneDefinition,
  HasOneRepositoryFactory,
  includeRelatedModels,
  InclusionResolver,
} from '../relations';
import {IsolationLevel, Transaction} from '../transaction';
import {isTypeResolver, resolveType} from '../type-resolver';
import {
  EntityCrudRepository,
  TransactionalEntityRepository,
} from './repository';

export namespace juggler {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  export import DataSource = legacy.DataSource;
  export import ModelBase = legacy.ModelBase;
  export import ModelBaseClass = legacy.ModelBaseClass;
  export import PersistedModel = legacy.PersistedModel;
  export import KeyValueModel = legacy.KeyValueModel;
  export import PersistedModelClass = legacy.PersistedModelClass;
  // eslint-disable-next-line @typescript-eslint/no-shadow
  export import Transaction = legacy.Transaction;
  // eslint-disable-next-line @typescript-eslint/no-shadow
  export import IsolationLevel = legacy.IsolationLevel;
}

function isModelClass(
  propertyType: PropertyType | undefined,
): propertyType is typeof Model {
  return (
    !isTypeResolver(propertyType) &&
    typeof propertyType === 'function' &&
    typeof (propertyType as typeof Model).definition === 'object' &&
    propertyType.toString().startsWith('class ')
  );
}

/**
 * This is a bridge to the legacy DAO class. The function mixes DAO methods
 * into a model class and attach it to a given data source
 * @param modelClass - Model class
 * @param ds - Data source
 * @returns {} The new model class with DAO (CRUD) operations
 */
export function bindModel<T extends juggler.ModelBaseClass>(
  modelClass: T,
  ds: juggler.DataSource,
): T {
  const BoundModelClass = class extends modelClass {};
  BoundModelClass.attachTo(ds);
  return BoundModelClass;
}

/**
 * Ensure the value is a promise
 * @param p - Promise or void
 */
export function ensurePromise<T>(p: legacy.PromiseOrVoid<T>): Promise<T> {
  if (p && p instanceof Promise) {
    return p;
  } else {
    return Promise.reject(new Error('The value should be a Promise: ' + p));
  }
}

/**
 * Default implementation of CRUD repository using legacy juggler model
 * and data source
 */
export class DefaultCrudRepository<
  T extends Entity,
  ID,
  Relations extends object = {},
> implements EntityCrudRepository<T, ID, Relations>
{
  modelClass: juggler.PersistedModelClass;

  public readonly inclusionResolvers: Map<
    string,
    InclusionResolver<T, Entity>
  > = new Map();

  /**
   * Constructor of DefaultCrudRepository
   * @param entityClass - LoopBack 4 entity class
   * @param dataSource - Legacy juggler data source
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

    this.modelClass = this.ensurePersistedModel(entityClass);
  }

  // Create an internal legacy Model attached to the datasource
  private ensurePersistedModel(
    entityClass: typeof Model,
  ): typeof juggler.PersistedModel {
    const definition = entityClass.definition;
    assert(
      !!definition,
      `Entity ${entityClass.name} must have valid model definition.`,
    );

    const dataSource = this.dataSource;

    const model = dataSource.getModel(definition.name);
    if (model) {
      // The backing persisted model has been already defined.
      return model as typeof juggler.PersistedModel;
    }

    return this.definePersistedModel(entityClass);
  }

  /**
   * Creates a legacy persisted model class, attaches it to the datasource and
   * returns it. This method can be overriden in sub-classes to acess methods
   * and properties in the generated model class.
   * @param entityClass - LB4 Entity constructor
   */
  protected definePersistedModel(
    entityClass: typeof Model,
  ): typeof juggler.PersistedModel {
    const dataSource = this.dataSource;
    const definition = entityClass.definition;

    // To handle circular reference back to the same model,
    // we create a placeholder model that will be replaced by real one later
    dataSource.getModel(definition.name, true /* forceCreate */);

    // We need to convert property definitions from PropertyDefinition
    // to plain data object because of a juggler limitation
    const properties: {[name: string]: object} = {};

    // We need to convert PropertyDefinition into the definition that
    // the juggler understands
    Object.entries(definition.properties).forEach(([key, value]) => {
      // always clone value so that we do not modify the original model definition
      // ensures that model definitions can be reused with multiple datasources
      if (value.type === 'array' || value.type === Array) {
        value = Object.assign({}, value, {
          type: [value.itemType && this.resolvePropertyType(value.itemType)],
        });
        delete value.itemType;
      } else {
        value = Object.assign({}, value, {
          type: this.resolvePropertyType(value.type),
        });
      }
      properties[key] = Object.assign({}, value);
    });
    const modelClass = dataSource.createModel<juggler.PersistedModelClass>(
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
    modelClass.attachTo(dataSource);
    return modelClass;
  }

  private resolvePropertyType(type: PropertyType): PropertyType {
    const resolved = resolveType(type);
    return isModelClass(resolved)
      ? this.ensurePersistedModel(resolved)
      : resolved;
  }

  /**
   * @deprecated
   * Function to create a constrained relation repository factory
   *
   * Use `this.createHasManyRepositoryFactoryFor()` instead
   *
   * @param relationName - Name of the relation defined on the source model
   * @param targetRepo - Target repository instance
   */
  protected _createHasManyRepositoryFactoryFor<
    Target extends Entity,
    TargetID,
    ForeignKeyType,
  >(
    relationName: string,
    targetRepositoryGetter: Getter<EntityCrudRepository<Target, TargetID>>,
  ): HasManyRepositoryFactory<Target, ForeignKeyType> {
    return this.createHasManyRepositoryFactoryFor(
      relationName,
      targetRepositoryGetter,
    );
  }

  /**
   * Function to create a constrained relation repository factory
   *
   * @example
   * ```ts
   * class CustomerRepository extends DefaultCrudRepository<
   *   Customer,
   *   typeof Customer.prototype.id,
   *   CustomerRelations
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
   * @param relationName - Name of the relation defined on the source model
   * @param targetRepo - Target repository instance
   */
  protected createHasManyRepositoryFactoryFor<
    Target extends Entity,
    TargetID,
    ForeignKeyType,
  >(
    relationName: string,
    targetRepositoryGetter: Getter<EntityCrudRepository<Target, TargetID>>,
  ): HasManyRepositoryFactory<Target, ForeignKeyType> {
    const meta = this.entityClass.definition.relations[relationName];
    return createHasManyRepositoryFactory<Target, TargetID, ForeignKeyType>(
      meta as HasManyDefinition,
      targetRepositoryGetter,
    );
  }

  /**
   * Function to create a constrained hasManyThrough relation repository factory
   *
   * @example
   * ```ts
   * class CustomerRepository extends DefaultCrudRepository<
   *   Customer,
   *   typeof Customer.prototype.id,
   *   CustomerRelations
   * > {
   *   public readonly cartItems: HasManyRepositoryFactory<CartItem, typeof Customer.prototype.id>;
   *
   *   constructor(
   *     protected db: juggler.DataSource,
   *     cartItemRepository: EntityCrudRepository<CartItem, typeof, CartItem.prototype.id>,
   *     throughRepository: EntityCrudRepository<Through, typeof Through.prototype.id>,
   *   ) {
   *     super(Customer, db);
   *     this.cartItems = this.createHasManyThroughRepositoryFactoryFor(
   *       'cartItems',
   *       cartItemRepository,
   *     );
   *   }
   * }
   * ```
   *
   * @param relationName - Name of the relation defined on the source model
   * @param targetRepo - Target repository instance
   * @param throughRepo - Through repository instance
   */
  protected createHasManyThroughRepositoryFactoryFor<
    Target extends Entity,
    TargetID,
    Through extends Entity,
    ThroughID,
    ForeignKeyType,
  >(
    relationName: string,
    targetRepositoryGetter:
      | Getter<EntityCrudRepository<Target, TargetID>>
      | {
          [repoType: string]: Getter<EntityCrudRepository<Target, TargetID>>;
        },
    throughRepositoryGetter: Getter<EntityCrudRepository<Through, ThroughID>>,
  ): HasManyThroughRepositoryFactory<
    Target,
    TargetID,
    Through,
    ForeignKeyType
  > {
    const meta = this.entityClass.definition.relations[relationName];
    return createHasManyThroughRepositoryFactory<
      Target,
      TargetID,
      Through,
      ThroughID,
      ForeignKeyType
    >(
      meta as HasManyDefinition,
      targetRepositoryGetter,
      throughRepositoryGetter,
    );
  }

  /**
   * @deprecated
   * Function to create a belongs to accessor
   *
   * Use `this.createBelongsToAccessorFor()` instead
   *
   * @param relationName - Name of the relation defined on the source model
   * @param targetRepo - Target repository instance
   */
  protected _createBelongsToAccessorFor<Target extends Entity, TargetId>(
    relationName: string,
    targetRepositoryGetter:
      | Getter<EntityCrudRepository<Target, TargetId>>
      | {
          [repoType: string]: Getter<EntityCrudRepository<Target, TargetId>>;
        },
  ): BelongsToAccessor<Target, ID> {
    return this.createBelongsToAccessorFor(
      relationName,
      targetRepositoryGetter,
    );
  }

  /**
   * Function to create a belongs to accessor
   *
   * @param relationName - Name of the relation defined on the source model
   * @param targetRepo - Target repository instance
   */
  protected createBelongsToAccessorFor<Target extends Entity, TargetId>(
    relationName: string,
    targetRepositoryGetter:
      | Getter<EntityCrudRepository<Target, TargetId>>
      | {
          [repoType: string]: Getter<EntityCrudRepository<Target, TargetId>>;
        },
  ): BelongsToAccessor<Target, ID> {
    const meta = this.entityClass.definition.relations[relationName];
    return createBelongsToAccessor<Target, TargetId, T, ID>(
      meta as BelongsToDefinition,
      targetRepositoryGetter,
      this,
    );
  }

  /**
   * @deprecated
   * Function to create a constrained hasOne relation repository factory
   *
   * @param relationName - Name of the relation defined on the source model
   * @param targetRepo - Target repository instance
   */
  protected _createHasOneRepositoryFactoryFor<
    Target extends Entity,
    TargetID,
    ForeignKeyType,
  >(
    relationName: string,
    targetRepositoryGetter:
      | Getter<EntityCrudRepository<Target, TargetID>>
      | {
          [repoType: string]: Getter<EntityCrudRepository<Target, TargetID>>;
        },
  ): HasOneRepositoryFactory<Target, ForeignKeyType> {
    return this.createHasOneRepositoryFactoryFor(
      relationName,
      targetRepositoryGetter,
    );
  }

  /**
   * Function to create a constrained hasOne relation repository factory
   *
   * @param relationName - Name of the relation defined on the source model
   * @param targetRepo - Target repository instance
   */
  protected createHasOneRepositoryFactoryFor<
    Target extends Entity,
    TargetID,
    ForeignKeyType,
  >(
    relationName: string,
    targetRepositoryGetter:
      | Getter<EntityCrudRepository<Target, TargetID>>
      | {
          [repoType: string]: Getter<EntityCrudRepository<Target, TargetID>>;
        },
  ): HasOneRepositoryFactory<Target, ForeignKeyType> {
    const meta = this.entityClass.definition.relations[relationName];
    return createHasOneRepositoryFactory<Target, TargetID, ForeignKeyType>(
      meta as HasOneDefinition,
      targetRepositoryGetter,
    );
  }

  async create(entity: DataObject<T>, options?: Options): Promise<T> {
    // perform persist hook
    const data = await this.entityToData(entity, options);
    const model = await ensurePromise(this.modelClass.create(data, options));
    return this.toEntity(model);
  }

  async createAll(entities: DataObject<T>[], options?: Options): Promise<T[]> {
    // perform persist hook
    const data = await Promise.all(
      entities.map(e => this.entityToData(e, options)),
    );
    const models = await ensurePromise(this.modelClass.create(data, options));
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

  async find(
    filter?: Filter<T>,
    options?: Options,
  ): Promise<(T & Relations)[]> {
    const include = filter?.include;
    const models = await ensurePromise(
      this.modelClass.find(this.normalizeFilter(filter), options),
    );
    const entities = this.toEntities(models);
    return this.includeRelatedModels(entities, include, options);
  }

  async findOne(
    filter?: Filter<T>,
    options?: Options,
  ): Promise<(T & Relations) | null> {
    const model = await ensurePromise(
      this.modelClass.findOne(this.normalizeFilter(filter), options),
    );
    if (!model) return null;
    const entity = this.toEntity(model);
    const include = filter?.include;
    const resolved = await this.includeRelatedModels(
      [entity],
      include,
      options,
    );
    return resolved[0];
  }

  async findById(
    id: ID,
    filter?: FilterExcludingWhere<T>,
    options?: Options,
  ): Promise<T & Relations> {
    const include = filter?.include;
    const model = await ensurePromise(
      this.modelClass.findById(id, this.normalizeFilter(filter), options),
    );
    if (!model) {
      throw new EntityNotFoundError(this.entityClass, id);
    }
    const entity = this.toEntity(model);
    const resolved = await this.includeRelatedModels(
      [entity],
      include,
      options,
    );
    return resolved[0];
  }

  update(entity: T, options?: Options): Promise<void> {
    return this.updateById(entity.getId(), entity, options);
  }

  async delete(entity: T, options?: Options): Promise<void> {
    // perform persist hook
    await this.entityToData(entity, options);
    return this.deleteById(entity.getId(), options);
  }

  async updateAll(
    data: DataObject<T>,
    where?: Where<T>,
    options?: Options,
  ): Promise<Count> {
    where = where ?? {};
    const persistedData = await this.entityToData(data, options);
    const result = await ensurePromise(
      this.modelClass.updateAll(where, persistedData, options),
    );
    return {count: result.count};
  }

  async updateById(
    id: ID,
    data: DataObject<T>,
    options?: Options,
  ): Promise<void> {
    if (id === undefined) {
      throw new Error('Invalid Argument: id cannot be undefined');
    }
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
      const payload = await this.entityToData(data, options);
      await ensurePromise(this.modelClass.replaceById(id, payload, options));
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

  /**
   * Execute a SQL command.
   *
   * **WARNING:** In general, it is always better to perform database actions
   * through repository methods. Directly executing SQL may lead to unexpected
   * results, corrupted data, security vulnerabilities and other issues.
   *
   * @example
   *
   * ```ts
   * // MySQL
   * const result = await repo.execute(
   *   'SELECT * FROM Products WHERE size > ?',
   *   [42]
   * );
   *
   * // PostgreSQL
   * const result = await repo.execute(
   *   'SELECT * FROM Products WHERE size > $1',
   *   [42]
   * );
   * ```
   *
   * @param command A parameterized SQL command or query.
   * Check your database documentation for information on which characters to
   * use as parameter placeholders.
   * @param parameters List of parameter values to use.
   * @param options Additional options, for example `transaction`.
   * @returns A promise which resolves to the command output as returned by the
   * database driver. The output type (data structure) is database specific and
   * often depends on the command executed.
   */
  execute(
    command: Command,
    parameters: NamedParameters | PositionalParameters,
    options?: Options,
  ): Promise<AnyObject>;

  /**
   * Execute a MongoDB command.
   *
   * **WARNING:** In general, it is always better to perform database actions
   * through repository methods. Directly executing MongoDB commands may lead
   * to unexpected results and other issues.
   *
   * @example
   *
   * ```ts
   * const result = await repo.execute('MyCollection', 'aggregate', [
   *   {$lookup: {
   *     // ...
   *   }},
   *   {$unwind: '$data'},
   *   {$out: 'tempData'}
   * ]);
   * ```
   *
   * @param collectionName The name of the collection to execute the command on.
   * @param command The command name. See
   * [Collection API docs](http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html)
   * for the list of commands supported by the MongoDB client.
   * @param parameters Command parameters (arguments), as described in MongoDB API
   * docs for individual collection methods.
   * @returns A promise which resolves to the command output as returned by the
   * database driver.
   */
  execute(
    collectionName: string,
    command: string,
    ...parameters: PositionalParameters
  ): Promise<AnyObject>;

  /**
   * Execute a raw database command using a connector that's not described
   * by LoopBack's `execute` API yet.
   *
   * **WARNING:** In general, it is always better to perform database actions
   * through repository methods. Directly executing database commands may lead
   * to unexpected results and other issues.
   *
   * @param args Command and parameters, please consult your connector's
   * documentation to learn about supported commands and their parameters.
   * @returns A promise which resolves to the command output as returned by the
   * database driver.
   */
  execute(...args: PositionalParameters): Promise<AnyObject>;

  async execute(...args: PositionalParameters): Promise<AnyObject> {
    return ensurePromise(this.dataSource.execute(...args));
  }

  protected toEntity<R extends T>(model: juggler.PersistedModel): R {
    return new this.entityClass(model.toObject()) as R;
  }

  protected toEntities<R extends T>(models: juggler.PersistedModel[]): R[] {
    return models.map(m => this.toEntity<R>(m));
  }

  /**
   * Register an inclusion resolver for the related model name.
   *
   * @param relationName - Name of the relation defined on the source model
   * @param resolver - Resolver function for getting related model entities
   */
  registerInclusionResolver(
    relationName: string,
    resolver: InclusionResolver<T, Entity>,
  ) {
    this.inclusionResolvers.set(relationName, resolver);
  }

  /**
   * Returns model instances that include related models of this repository
   * that have a registered resolver.
   *
   * @param entities - An array of entity instances or data
   * @param include -Inclusion filter
   * @param options - Options for the operations
   */
  protected async includeRelatedModels(
    entities: T[],
    include?: InclusionFilter[],
    options?: Options,
  ): Promise<(T & Relations)[]> {
    return includeRelatedModels<T, Relations>(this, entities, include, options);
  }

  /**
   * This function works as a persist hook.
   * It converts an entity from the CRUD operations' caller
   * to a persistable data that can will be stored in the
   * back-end database.
   *
   * User can extend `DefaultCrudRepository` then override this
   * function to execute custom persist hook.
   * @param entity The entity passed from CRUD operations' caller.
   * @param options
   */
  protected async entityToData<R extends T>(
    entity: R | DataObject<R>,
    options = {},
  ): Promise<legacy.ModelData<legacy.PersistedModel>> {
    return this.ensurePersistable(entity, options);
  }

  /** Converts an entity object to a JSON object to check if it contains navigational property.
   * Throws an error if `entity` contains navigational property.
   *
   * @param entity The entity passed from CRUD operations' caller.
   * @param options
   */
  protected ensurePersistable<R extends T>(
    entity: R | DataObject<R>,
    options = {},
  ): legacy.ModelData<legacy.PersistedModel> {
    // FIXME(bajtos) Ideally, we should call toJSON() to convert R to data object
    // Unfortunately that breaks replaceById for MongoDB connector, where we
    // would call replaceId with id *argument* set to ObjectID value but
    // id *property* set to string value.
    /*
    const data: AnyObject =
      typeof entity.toJSON === 'function' ? entity.toJSON() : {...entity};
    */
    const data: DeepPartial<R> = new this.entityClass(entity);

    rejectNavigationalPropertiesInData(this.entityClass, data);

    return data;
  }

  /**
   * Removes juggler's "include" filter as it does not apply to LoopBack 4
   * relations.
   *
   * @param filter - Query filter
   */
  protected normalizeFilter(filter?: Filter<T>): legacy.Filter | undefined {
    if (!filter) return undefined;
    return {...filter, include: undefined} as legacy.Filter;
  }
}

/**
 * Default implementation of CRUD repository using legacy juggler model
 * and data source with beginTransaction() method for connectors which
 * support Transactions
 */

export class DefaultTransactionalRepository<
    T extends Entity,
    ID,
    Relations extends object = {},
  >
  extends DefaultCrudRepository<T, ID, Relations>
  implements TransactionalEntityRepository<T, ID, Relations>
{
  async beginTransaction(
    options?: IsolationLevel | Options,
  ): Promise<Transaction> {
    const dsOptions: juggler.IsolationLevel | Options = options ?? {};
    // juggler.Transaction still has the Promise/Callback variants of the
    // Transaction methods
    // so we need it cast it back
    return (await this.dataSource.beginTransaction(dsOptions)) as Transaction;
  }
}
