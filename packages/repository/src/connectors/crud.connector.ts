// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Filter, Where} from '@loopback/filter';
import {Class, Count, Options} from '../common-types';
import {Entity, EntityData} from '../model';
import {Connector} from './connector';

/**
 * CRUD operations for connector implementations
 */
export interface CrudConnector extends Connector {
  /**
   * Create a new entity
   * @param modelClass - The model class
   * @param entity - The entity instance or data
   * @param options - Options for the operation
   * @returns A promise of the entity created
   */
  create(
    modelClass: Class<Entity>,
    entity: EntityData,
    options?: Options,
  ): Promise<EntityData>;

  /**
   * Create multiple entities
   * @param modelClass - The model class
   * @param entities - An array of entity instances or data
   * @param options - Options for the operation
   * @returns A promise of an array of entities created
   */
  createAll?(
    modelClass: Class<Entity>,
    entities: EntityData[],
    options?: Options,
  ): Promise<EntityData[]>;

  /**
   * Save an entity
   * @param modelClass - The model class
   * @param entity - The entity instance or data
   * @param options - Options for the operation
   * @returns A promise of the entity saved
   */
  save?(
    modelClass: Class<Entity>,
    entity: EntityData,
    options?: Options,
  ): Promise<EntityData>;

  /**
   * Find matching entities by the filter
   * @param modelClass - The model class
   * @param filter - The query filter
   * @param options - Options for the operation
   * @returns A promise of an array of entities found for the filter
   */
  find(
    modelClass: Class<Entity>,
    filter?: Filter,
    options?: Options,
  ): Promise<EntityData[]>;

  /**
   * Find an entity by id
   * @param modelClass - The model class
   * @param id - The entity id value
   * @param options - Options for the operation
   * @returns A promise of the entity found for the id
   */
  findById?<IdType>(
    modelClass: Class<Entity>,
    id: IdType,
    options?: Options,
  ): Promise<EntityData>;

  /**
   * Update an entity
   * @param modelClass - The model class
   * @param entity - The entity instance or data
   * @param options - Options for the operation
   * @returns Promise<true> if an entity is updated, otherwise
   * Promise<false>
   */
  update?(
    modelClass: Class<Entity>,
    entity: EntityData,
    options?: Options,
  ): Promise<boolean>;

  /**
   * Delete an entity
   * @param modelClass - The model class
   * @param entity - The entity instance or data
   * @param options - Options for the operation
   * @returns Promise<true> if an entity is deleted, otherwise
   * Promise<false>
   */
  delete?(
    modelClass: Class<Entity>,
    entity: EntityData,
    options?: Options,
  ): Promise<boolean>;

  /**
   * Update matching entities
   * @param modelClass - The model class
   * @param data - The data attributes to be updated
   * @param where - The matching criteria
   * @param options - Options for the operation
   * @returns A promise of number of matching entities deleted
   */
  updateAll(
    modelClass: Class<Entity>,
    data: EntityData,
    where?: Where<Entity>,
    options?: Options,
  ): Promise<Count>;

  /**
   * Update an entity by id
   * @param modelClass - The model class
   * @param id - The entity id value
   * @param data - The data attributes to be updated
   * @param options - Options for the operation
   * @returns Promise<true> if an entity is updated for the id, otherwise
   * Promise<false>
   */
  updateById?<IdType>(
    modelClass: Class<Entity>,
    id: IdType,
    data: EntityData,
    options?: Options,
  ): Promise<boolean>;

  /**
   * Replace an entity by id
   * @param modelClass - The model class
   * @param id - The entity id value
   * @param data - The data attributes to be updated
   * @param options - Options for the operation
   * @returns Promise<true> if an entity is replaced for the id, otherwise
   * Promise<false>
   */
  replaceById?<IdType>(
    modelClass: Class<Entity>,
    id: IdType,
    data: EntityData,
    options?: Options,
  ): Promise<boolean>;

  /**
   * Delete matching entities
   * @param modelClass - The model class
   * @param where - The matching criteria
   * @param options - Options for the operation
   * @returns A promise of number of matching entities deleted
   */
  deleteAll(
    modelClass: Class<Entity>,
    where?: Where<Entity>,
    options?: Options,
  ): Promise<Count>;

  /**
   * Delete an entity by id
   * @param modelClass - The model class
   * @param id - The entity id value
   * @param options - Options for the operation
   * @returns Promise<true> if an entity is deleted for the id, otherwise
   * Promise<false>
   */
  deleteById?<IdType>(
    modelClass: Class<Entity>,
    id: IdType,
    options?: Options,
  ): Promise<boolean>;

  /**
   * Count matching entities
   * @param modelClass - The model class
   * @param where - The matching criteria
   * @param options - Options for the operation
   * @returns A promise of number of matching entities
   */
  count(
    modelClass: Class<Entity>,
    where?: Where<Entity>,
    options?: Options,
  ): Promise<Count>;

  /**
   * Check if an entity exists for the id
   * @param modelClass - The model class
   * @param id - The entity id value
   * @param options - Options for the operation
   * @returns Promise<true> if an entity exists for the id, otherwise
   * Promise<false>
   */
  exists?<IdType>(
    modelClass: Class<Entity>,
    id: IdType,
    options?: Options,
  ): Promise<boolean>;
}
