// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/context';
import * as assert from 'assert';
import * as debugFactory from 'debug';
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
import {Entity, Model, PropertyType} from '../model';
import {Filter, Inclusion, Where} from '../query';
import {
  BelongsToAccessor,
  BelongsToDefinition,
  BelongsToInclusionResolver,
  createBelongsToAccessor,
  createHasManyRepositoryFactory,
  createHasOneRepositoryFactory,
  HasManyDefinition,
  HasManyInclusionResolver,
  HasManyRepositoryFactory,
  HasOneDefinition,
  HasOneRepositoryFactory,
  InclusionResolver,
  RelationMetadata,
} from '../relations';
import {HasOneInclusionResolver} from '../relations/has-one/has-one.inclusion-resolver';
import {isTypeResolver, resolveType} from '../type-resolver';
import {EntityCrudRepository} from './repository';

const debug = debugFactory('loopback:repository:legacy-juggler-bridge');

export namespace juggler {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  export import DataSource = legacy.DataSource;
  export import ModelBase = legacy.ModelBase;
  export import ModelBaseClass = legacy.ModelBaseClass;
  export import PersistedModel = legacy.PersistedModel;
  export import KeyValueModel = legacy.KeyValueModel;
  export import PersistedModelClass = legacy.PersistedModelClass;
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
  Relations extends object = {}
> implements EntityCrudRepository<T, ID, Relations> {
  modelClass: juggler.PersistedModelClass;
  protected inclusionResolvers: {[key: string]: InclusionResolver};

  /**
   * Constructor of DefaultCrudRepository
   * @param entityClass - Legacy entity class
   * @param dataSource - Legacy data source
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

    this.modelClass = this.definePersistedModel(entityClass);

    // Important! Create the map object with `null` prototype to avoid
    // Prototype Poisoning vulnerabilities.
    this.inclusionResolvers = Object.create(null);
  }

  // Create an internal legacy Model attached to the datasource
  private definePersistedModel(
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
      ? this.definePersistedModel(resolved)
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
   * TODO - add docs
   * @param relationName
   * @param targetRepoGetter
   */
  protected registerHasManyInclusion<
    Target extends Entity,
    TargetID,
    TargetRelations extends object
  >(
    relationName: string,
    targetRepoGetter: Getter<
      EntityCrudRepository<Target, TargetID, TargetRelations>
    >,
  ) {
    this.inclusionResolvers[relationName] = new HasManyInclusionResolver(
      this.getRelationDefinition(relationName) as HasManyDefinition,
      targetRepoGetter,
    );
  }

  /**
   * TODO - add docs
   * @param relationName
   * @param targetRepoGetter
   */
  protected registerHasOneInclusion<
    Target extends Entity,
    TargetID,
    TargetRelations extends object
  >(
    relationName: string,
    targetRepoGetter: Getter<
      EntityCrudRepository<Target, TargetID, TargetRelations>
    >,
  ) {
    this.inclusionResolvers[relationName] = new HasOneInclusionResolver(
      this.getRelationDefinition(relationName) as HasOneDefinition,
      targetRepoGetter,
    );
  }

  /**
   * TODO - add docs
   * @param relationName
   * @param targetRepoGetter
   */
  protected registerBelongsToInclusion<
    Target extends Entity,
    TargetID,
    TargetRelations extends object
  >(
    relationName: string,
    targetRepoGetter: Getter<
      EntityCrudRepository<Target, TargetID, TargetRelations>
    >,
  ) {
    this.inclusionResolvers[relationName] = new BelongsToInclusionResolver(
      this.getRelationDefinition(relationName) as BelongsToDefinition,
      targetRepoGetter,
    );
  }

  protected getRelationDefinition(relationName: string): RelationMetadata {
    const relations = this.entityClass.definition.relations;
    const meta = relations[relationName];
    // FIXME(bajtos) Throw a helpful error when the relationName was not found
    return meta;
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
    targetRepoGetter: Getter<EntityCrudRepository<Target, TargetId>>,
  ): BelongsToAccessor<Target, ID> {
    return this.createBelongsToAccessorFor(relationName, targetRepoGetter);
  }

  /**
   * Function to create a belongs to accessor
   *
   * @param relationName - Name of the relation defined on the source model
   * @param targetRepo - Target repository instance
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
    ForeignKeyType
  >(
    relationName: string,
    targetRepoGetter: Getter<EntityCrudRepository<Target, TargetID>>,
  ): HasOneRepositoryFactory<Target, ForeignKeyType> {
    return this.createHasOneRepositoryFactoryFor(
      relationName,
      targetRepoGetter,
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

  async find(
    filter?: Filter<T>,
    options?: Options,
  ): Promise<(T & Relations)[]> {
    const models = await ensurePromise(
      this.modelClass.find(this.normalizeFilter(filter), options),
    );
    const entities = this.toEntities(models);
    return this.includeRelatedModels(entities, filter, options);
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
    const resolved = await this.includeRelatedModels([entity], filter, options);
    return resolved[0];
  }

  async findById(
    id: ID,
    filter?: Filter<T>,
    options?: Options,
  ): Promise<T & Relations> {
    const model = await ensurePromise(
      this.modelClass.findById(id, this.normalizeFilter(filter), options),
    );
    if (!model) {
      throw new EntityNotFoundError(this.entityClass, id);
    }
    const entity = this.toEntity(model);
    const resolved = await this.includeRelatedModels([entity], filter, options);
    return resolved[0];
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
    parameters: NamedParameters | PositionalParameters,
    options?: Options,
  ): Promise<AnyObject> {
    return ensurePromise(this.dataSource.execute(command, parameters, options));
  }

  protected toEntity<R extends T>(model: juggler.PersistedModel): R {
    return new this.entityClass(model.toObject()) as R;
  }

  protected toEntities<R extends T>(models: juggler.PersistedModel[]): R[] {
    return models.map(m => this.toEntity<R>(m));
  }

  protected normalizeFilter(filter?: Filter<T>): legacy.Filter | undefined {
    if (!filter) return undefined;
    return {...filter, include: undefined} as legacy.Filter;
  }

  protected async includeRelatedModels(
    entities: T[],
    filter?: Filter<T>,
    _options?: Options,
  ): Promise<(T & Relations)[]> {
    const result = entities as (T & Relations)[];

    const include = filter && filter.include;
    if (!include) return result;

    const invalidInclusions = include.filter(i => !this.isInclusionAllowed(i));
    if (invalidInclusions.length) {
      const msg =
        'Invalid "filter.include" entries: ' +
        invalidInclusions.map(i => JSON.stringify(i)).join('; ');
      const err = new Error(msg);
      Object.assign(err, {
        code: 'INVALID_INCLUSION_FILTER',
      });
      throw err;
    }

    const resolveTasks = include.map(i => {
      const relationName = i.relation!;
      const handler = this.inclusionResolvers[relationName];
      return handler.fetchIncludedModels(entities, i);
    });

    await Promise.all(resolveTasks);

    return result;
  }

  private isInclusionAllowed(inclusion: Inclusion): boolean {
    const relationName = inclusion.relation;
    if (!relationName) {
      debug('isInclusionAllowed for %j? No: missing relation name', inclusion);
      return false;
    }
    const allowed = Object.prototype.hasOwnProperty.call(
      this.inclusionResolvers,
      relationName,
    );

    debug('isInclusionAllowed for %j (relation %s)? %s', inclusion, allowed);
    return allowed;
  }
}
