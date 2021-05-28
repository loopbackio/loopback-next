// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import assert from 'assert';
import {PrototypeOf} from './common-types';
import {Entity, Model} from './model';
import {
  DefaultCrudRepository,
  DefaultKeyValueRepository,
  juggler,
  Repository,
} from './repositories';

/**
 * Signature for a Repository class bound to a given model. The constructor
 * accepts only the dataSource to use for persistence.
 *
 * `define*` functions return a class implementing this interface.
 *
 * @typeParam M - Model class
 * @typeParam R - Repository class/interface
 */
export interface ModelRepositoryClass<
  M extends Model,
  R extends Repository<M>,
> {
  /**
   * The constructor for the generated repository class
   * @param dataSource - DataSource object
   */
  new (dataSource: juggler.DataSource): R;
  prototype: R;
}

/**
 * Signature for repository classes that can be used as the base class for
 * `define*` functions. The constructor of a base repository class accepts
 * the target model constructor and the datasource to use.
 *
 * `define*` functions require a class implementing this interface on input.
 *
 * @typeParam M - Model class constructor, e.g `typeof Model`.
 * **❗️IMPORTANT: The type argument `M` is describing the model constructor type
 * (e.g. `typeof Model`), not the model instance type (`Model`) as is the case
 * in other repository-related types. The constructor type is required
 * to support custom repository classes requiring a Model subclass in the
 * constructor arguments, e.g. `Entity` or a user-provided model.**
 *
 * @typeParam R - Repository class/interface
 */
export interface BaseRepositoryClass<
  M extends typeof Model,
  R extends Repository<PrototypeOf<M>>,
> {
  /**
   * The constructor for the generated repository class
   * @param modelClass - Model class
   * @param dataSource - DataSource object
   */
  new (modelClass: M, dataSource: juggler.DataSource): R;
  prototype: R;
}

/**
 * Create (define) a repository class for the given model.
 *
 * See also `defineCrudRepositoryClass` and `defineKeyValueRepositoryClass`
 * for convenience wrappers providing repository class factory for the default
 * CRUD and KeyValue implementations.
 *
 * **❗️IMPORTANT: The compiler (TypeScript 3.8) is not able to correctly infer
 * generic arguments `M` and `R` from the class constructors provided in
 * function arguments. You must always provide both M and R types explicitly.**
 *
 * @example
 *
 * ```ts
 * const AddressRepository = defineRepositoryClass<
 *   typeof Address,
 *   DefaultEntityCrudRepository<
 *    Address,
 *    typeof Address.prototype.id,
 *    AddressRelations
 *   >,
 * >(Address, DefaultCrudRepository);
 * ```
 *
 * @param modelClass - A model class such as `Address`.
 * @param baseRepositoryClass - Repository implementation to use as the base,
 * e.g. `DefaultCrudRepository`.
 *
 * @typeParam M - Model class constructor (e.g. `typeof Address`)
 * @typeParam R - Repository class (e.g. `DefaultCrudRepository<Address, number>`)
 */
export function defineRepositoryClass<
  M extends typeof Model,
  R extends Repository<PrototypeOf<M>>,
>(
  modelClass: M,
  baseRepositoryClass: BaseRepositoryClass<M, R>,
): ModelRepositoryClass<PrototypeOf<M>, R> {
  const repoName = modelClass.name + 'Repository';
  const defineNamedRepo = new Function(
    'ModelCtor',
    'BaseRepository',
    `return class ${repoName} extends BaseRepository {
      constructor(dataSource) {
        super(ModelCtor, dataSource);
      }
    };`,
  );

  const repo = defineNamedRepo(modelClass, baseRepositoryClass);
  assert.equal(repo.name, repoName);
  return repo;
}

/**
 * Create (define) an entity CRUD repository class for the given model.
 * This function always uses `DefaultCrudRepository` as the base class,
 * use `defineRepositoryClass` if you want to use your own base repository.
 *
 * @example
 *
 * ```ts
 * const ProductRepository = defineCrudRepositoryClass<
 *   Product,
 *   typeof Product.prototype.id,
 *   ProductRelations
 * >(Product);
 * ```
 *
 * @param entityClass - An entity class such as `Product`.
 *
 * @typeParam E - An entity class
 * @typeParam IdType - ID type for the entity
 * @typeParam Relations - Relations for the entity
 */
export function defineCrudRepositoryClass<
  E extends Entity,
  IdType,
  Relations extends object,
>(
  entityClass: typeof Entity & {prototype: E},
): ModelRepositoryClass<E, DefaultCrudRepository<E, IdType, Relations>> {
  return defineRepositoryClass(entityClass, DefaultCrudRepository);
}

/**
 * Create (define) a KeyValue repository class for the given entity.
 * This function always uses `DefaultKeyValueRepository` as the base class,
 * use `defineRepositoryClass` if you want to use your own base repository.
 *
 * @example
 *
 * ```ts
 * const ProductKeyValueRepository = defineKeyValueRepositoryClass(Product);
 * ```
 *
 * @param modelClass - An entity class such as `Product`.
 *
 * @typeParam M - Model class
 */
export function defineKeyValueRepositoryClass<M extends Model>(
  modelClass: typeof Model & {prototype: M},
): ModelRepositoryClass<M, DefaultKeyValueRepository<M>> {
  return defineRepositoryClass(modelClass, DefaultKeyValueRepository);
}
