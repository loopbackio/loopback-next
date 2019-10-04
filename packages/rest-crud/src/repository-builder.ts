// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest-crud
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  DefaultCrudRepository,
  Entity,
  EntityCrudRepository,
  juggler,
} from '@loopback/repository';
import * as assert from 'assert';

/**
 * Create (define) a repository class for the given model.
 *
 * Example usage:
 *
 * ```ts
 * const ProductRepository = defineCrudRepositoryClass(Product);
 * ```
 *
 * @param modelCtor A model class, e.g. `Product`.
 */
export function defineCrudRepositoryClass<
  T extends Entity,
  IdType,
  Relations extends object = {}
>(
  entityClass: typeof Entity & {prototype: T},
): RepositoryClass<T, IdType, Relations> {
  const repoName = entityClass.name + 'Repository';
  const defineNamedRepo = new Function(
    'EntityCtor',
    'BaseRepository',
    `return class ${repoName} extends BaseRepository {
      constructor(dataSource) {
        super(EntityCtor, dataSource);
      }
    };`,
  );

  // TODO(bajtos) make DefaultCrudRepository configurable (?)
  const repo = defineNamedRepo(entityClass, DefaultCrudRepository);
  assert.equal(repo.name, repoName);
  return repo;
}

export interface RepositoryClass<
  T extends Entity,
  IdType,
  Relations extends object
> {
  new (ds: juggler.DataSource): EntityCrudRepository<T, IdType, Relations>;
}
