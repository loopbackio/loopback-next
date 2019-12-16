// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Count, DataObject, Entity, Filter, Options, Where} from '../..';

/**
 * CRUD operations for a target repository of a HasManyThrough relation
 *
 * EXPERIMENTAL: This interface is not stable and may change in the near future.
 * Backwards-incompatible changes may be introduced in semver-minor versions.
 */
export interface HasManyThroughRepository<
  Target extends Entity,
  TargetID,
  Through extends Entity
> {
  /**
   * Create a target model instance
   * @param targetModelData - The target model data
   * @param options - Options for the operation
   * @returns A promise which resolves to the newly created target model instance
   */
  create(
    targetModelData: DataObject<Target>,
    options?: Options & {
      throughData?: DataObject<Through>;
      throughOptions?: Options;
    },
  ): Promise<Target>;

  /**
   * Find target model instance(s)
   * @param filter - A filter object for where, order, limit, etc.
   * @param options - Options for the operation
   * @returns A promise which resolves with the found target instance(s)
   */
  find(
    filter?: Filter<Target>,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<Target[]>;

  /**
   * Delete multiple target model instances
   * @param where - Instances within the where scope are deleted
   * @param options
   * @returns A promise which resolves the deleted target model instances
   */
  delete(
    where?: Where<Target>,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<Count>;

  /**
   * Patch multiple target model instances
   * @param dataObject - The fields and their new values to patch
   * @param where - Instances within the where scope are patched
   * @param options
   * @returns A promise which resolves the patched target model instances
   */
  patch(
    dataObject: DataObject<Target>,
    where?: Where<Target>,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<Count>;

  /**
   * Creates a new many-to-many association to an existing target model instance
   * @param targetModelId - The target model ID to link
   * @param options
   * @returns A promise which resolves to the linked target model instance
   */
  link(
    targetModelId: TargetID,
    options?: Options & {
      throughData?: DataObject<Through>;
      throughOptions?: Options;
    },
  ): Promise<Target>;

  /**
   * Removes an association to an existing target model instance
   * @param targetModelId - The target model to unlink
   * @param options
   * @returns A promise which resolves to null
   */
  unlink(
    targetModelId: TargetID,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<void>;
}
