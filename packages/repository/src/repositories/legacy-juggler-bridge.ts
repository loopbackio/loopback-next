// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
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
import {EntityNotFoundError, InvalidBodyError} from '../errors';
import {
  Entity,
  Model,
  PropertyType,
  rejectNavigationalPropertiesInData,
} from '../model';
import {
  BelongsToAccessor,
  BelongsToDefinition,
  HasManyDefinition,
  HasManyRepositoryFactory,
  HasManyThroughRepositoryFactory,
  HasOneDefinition,
  HasOneRepositoryFactory,
  InclusionResolver,
  ReferencesManyAccessor,
  ReferencesManyDefinition,
  createBelongsToAccessor,
  createHasManyRepositoryFactory,
  createHasManyThroughRepositoryFactory,
  createHasOneRepositoryFactory,
  createReferencesManyAccessor,
  includeRelatedModels,
} from '../relations';
import {IsolationLevel, Transaction} from '../transaction';
import {isTypeResolver, resolveType} from '../type-resolver';
import {
  EntityCrudRepository,
  TransactionalEntityRepository,
} from './repository';

export namespace juggler {
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

import {DatabaseDriverError} from '../errors';

function handleDatabaseDriverError(
  this: DefaultCrudRepository<Entity, unknown, AnyObject>,
  err: unknown,
): never {
  const error = err as AnyObject;
  if (err === null || err === undefined) {
    throw new Error('An unknown database execution error occurred.');
  }

  // Handling existing already mapped errors
  if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
    throw error;
  }

  const parsedCode = Number(error.code);
  const rawCode = !isNaN(parsedCode) ? error.code : error.errno; // error.code for posgres while errno for mysql/mongodb

  const codeStr = String(rawCode);

  // Initialize with default values
  let statusCode = 500;
  let errorCode = 'DATABASE_ERROR';
  let message = error.message || 'An unexpected database error occurred.';

  // Evaluate database signatures and re-map properties dynamically
  switch (codeStr) {
    // 1. Unique Key / Duplicate Entries
    case '23505': // Postgres
    case '1062': // MySQL
    case '11000': // MongoDB
    case '11001':
      statusCode = 409;
      errorCode = 'DB_UNIQUE_CONSTRAINT_VIOLATION';
      message =
        'The operation conflicts with an existing record unique constraint.';
      break;
    // 2. Foreign Key Constraints (Missing Parents / Existing Children)
    case '23503': // Postgres
    case '1216': // MySQL
    case '1217':
    case '1451':
    case '1452':
      statusCode = 422;
      errorCode = 'DB_FOREIGN_KEY_VIOLATION';
      message =
        'Relational integrity validation failed. Referenced parent record not found.';
      break;
    // 3. Null / Required Fields Omissions
    case '23502': // Postgres
    case '1048': // MySQL
    case '1364':
    case '121': // MongoDB Document Validation Failed
      statusCode = 400;
      errorCode = 'DB_NOT_NULL_VIOLATION';
      message = 'Required database schema properties are missing or null.';
      break;
    // 4. Bad Casts / Truncation / Data Type Mismatch
    case '22P02': // Postgres Invalid Text Representation (e.g. Bad UUID format)
    case '22001': // Postgres String Data Right Truncation
    case '1265': // MySQL Data Truncated
    case '1366':
      statusCode = 400;
      errorCode = 'DB_DATA_TYPE_MISMATCH';
      message =
        'The query properties contain unexpected formatting types or overflows.';
      break;
    case '3105': // MySQL Server Generated column value ignored/disallowed
    case '1906': // MariaDB Generated column value ignored/disallowed
      statusCode = 400;
      errorCode = 'DB_GENERATED_COLUMN_VIOLATION';
      message =
        'Cannot manually assign or update values on a database-generated computed column.';
      break;
    // 5. Missing Table / Schema Definition Errors
    case '1146': // MySQL errno for missing table
    case '42P01': // Postgres error code for undefined_table
      statusCode = 400; // Setting as 400 because 500 is too generic and doesn't provide enough context for the client
      errorCode = 'DB_SCHEMA_MISSING_TABLE';
      message = 'The requested database table or relation does not exist.';
      break;
    // 6. Query Timeout Errors
    case '57014': // Postgres query_canceled
    case '1907': // MySQL query_timeout
    case '3024': // MongoDB query_timeout
      statusCode = 504;
      errorCode = 'DB_QUERY_TIMEOUT';
      message = 'The database operation took too long and was aborted.';
      break;
    // 7. Concurrency / Locking Conflicts
    case '40001': // Postgres serialization_failure
    case '40P01': // Postgres deadlock_detected
    case '1213': // MySQL deadlock found when trying to get lock
    case '1205': // MySQL lock wait timeout exceeded
      statusCode = 409;
      errorCode = 'DB_LOCK_CONFLICT';
      message =
        'A concurrency lock conflict occurred. Please retry the operation.';
      break;
    // 8.  Check Constraint / Business Logic Violations
    case '23514': // Postgres check_violation
    case '23P01': // Postgres exclusion_violation
    case '3819': // MySQL check constraint violation
      statusCode = 400;
      errorCode = 'DB_CHECK_CONSTRAINT_VIOLATION';
      message =
        'The data violates database business logic or range constraints.';
      break;
    // 9. Connection / Availability Issues
    case '08003': // Postgres connection_does_not_exist
    case '08006': // Postgres connection_failure
    case '53300': // Postgres too_many_connections
    case '1040': //  MySQL too many connections
    case '2002': // MySQL connection refused
    case '2003': // MySQL can't connect to MySQL server
    case '2006': // MySQL server has gone away
    case '2013': // MySQL lost connection to MySQL server during query
    case '8000': // MongoDB network error
    case '8001': // MongoDB connection closed
    case '8002': // MongoDB connection timeout
      statusCode = 503;
      errorCode = 'DB_CONNECTION_FAILURE';
      message =
        'The database is temporarily unavailable or overloaded. Please try again later.';
      break;
    // 10. Numeric Overflow / Out of Range Values
    case '22003': // Postgres numeric_value_out_of_range
    case '1264': // MySQL Out of range value for column
      statusCode = 400;
      errorCode = 'DB_NUMERIC_OUT_OF_RANGE';
      message =
        'A numeric or string value exceeds the maximum allowable size for the field.';
      break;
  }
  if (error.stack) console.error(error.stack);

  // If we matched a standard driver rule, throw our clean uniform class
  if (statusCode !== 500) {
    throw new DatabaseDriverError(this.entityClass, message, {
      code: errorCode,
      statusCode: statusCode,
      nativeCode: rawCode,
    });
  }

  // Otherwise, bubble up the original error safely to protect core connection strings/etc.
  throw err;
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
> implements EntityCrudRepository<T, ID, Relations> {
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
   * returns it. This method can be overridden in sub-classes to acess methods
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

  /**
   * @deprecated
   * Function to create a references many accessor
   *
   * Use `this.createReferencesManyAccessorFor()` instead
   *
   * @param relationName - Name of the relation defined on the source model
   * @param targetRepo - Target repository instance
   */
  protected _createReferencesManyAccessorFor<Target extends Entity, TargetId>(
    relationName: string,
    targetRepoGetter: Getter<EntityCrudRepository<Target, TargetId>>,
  ): ReferencesManyAccessor<Target, ID> {
    return this.createReferencesManyAccessorFor(relationName, targetRepoGetter);
  }

  /**
   * Function to create a references many accessor
   *
   * @param relationName - Name of the relation defined on the source model
   * @param targetRepo - Target repository instance
   */
  protected createReferencesManyAccessorFor<Target extends Entity, TargetId>(
    relationName: string,
    targetRepoGetter: Getter<EntityCrudRepository<Target, TargetId>>,
  ): ReferencesManyAccessor<Target, ID> {
    const meta = this.entityClass.definition.relations[relationName];
    return createReferencesManyAccessor<Target, TargetId, T, ID>(
      meta as ReferencesManyDefinition,
      targetRepoGetter,
      this,
    );
  }

  async create(entity: DataObject<T>, options?: Options): Promise<T> {
    // perform persist hook
    const data = await this.entityToData(entity, options);
    const model = await ensurePromise(
      this.modelClass.create(data, options),
    ).catch(handleDatabaseDriverError);
    return this.toEntity(model);
  }

  async createAll(entities: DataObject<T>[], options?: Options): Promise<T[]> {
    // perform persist hook
    const data = await Promise.all(
      entities.map(e => this.entityToData(e, options)),
    );
    const models = await ensurePromise(
      this.modelClass.createAll(data, options),
    ).catch(handleDatabaseDriverError);
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
    ).catch(handleDatabaseDriverError);
    const entities = this.toEntities(models);
    return this.includeRelatedModels(entities, include, options);
  }

  async findOne(
    filter?: Filter<T>,
    options?: Options,
  ): Promise<(T & Relations) | null> {
    const model = await ensurePromise(
      this.modelClass.findOne(this.normalizeFilter(filter), options),
    ).catch(handleDatabaseDriverError);
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
    ).catch(handleDatabaseDriverError);
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
    ).catch(handleDatabaseDriverError);
    return {count: result.count};
  }

  async updateById(
    id: ID,
    data: DataObject<T>,
    options?: Options,
  ): Promise<void> {
    if (!Object.keys(data).length) {
      throw new InvalidBodyError(this.entityClass, id);
    }
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
      await ensurePromise(
        this.modelClass.replaceById(id, payload, options),
      ).catch(handleDatabaseDriverError);
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
    ).catch(handleDatabaseDriverError);
    return {count: result.count};
  }

  async deleteById(id: ID, options?: Options): Promise<void> {
    const result = await ensurePromise(
      this.modelClass.deleteById(id, options),
    ).catch(handleDatabaseDriverError);
    if (result.count === 0) {
      throw new EntityNotFoundError(this.entityClass, id);
    }
  }

  async count(where?: Where<T>, options?: Options): Promise<Count> {
    const result = await ensurePromise(
      this.modelClass.count(where, options),
    ).catch(handleDatabaseDriverError);
    return {count: result};
  }

  exists(id: ID, options?: Options): Promise<boolean> {
    return ensurePromise(this.modelClass.exists(id, options)).catch(
      handleDatabaseDriverError,
    );
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
