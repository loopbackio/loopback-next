import {
  DefaultCrudRepository,
  DataSourceType,
  EntityCrudRepository,
  EntityRepository,
  CrudRepository,
  Repository,
  juggler,
} from '.';
import {
  Entity,
  Filter,
  AnyObject,
  Where,
  DataObject,
  Options,
  FilterBuilder,
  WhereBuilder,
} from '..';

/**
 * CRUD operations for a target repository of a HasMany relation
 */
export interface HasManyEntityCrudRepository<T extends Entity, ID>
  extends EntityCrudRepository<T, ID> {
  /**
   * Build a target model instance
   * @param targetModelData The target model data
   * @returns A promise of the created model instance
   */
  build(targetModelData: DataObject<T>): Promise<T>;
}

export class DefaultHasManyEntityCrudRepositorys<T extends Entity, ID>
  implements HasManyEntityCrudRepository<T, ID> {
  /**
   * Constructor of DefaultCrudRepository
   * @param targetModel the target mdoel class
   * @param targetId the constraints to scope target repo CRUD methods
   */
  constructor(
    public targetModel: typeof Entity & {prototype: T},
    public targetId: ID,
  ) {}
  execute(
    command: string | AnyObject,
    // tslint:disable-next-line:no-any
    parameters: any[] | AnyObject,
    options?: Options,
  ): Promise<AnyObject> {
    throw new Error('Method not implemented.');
  }
  /**
   * Create a target model instance
   * @param targetModelData The target model data
   * @param options Options for the operation
   * @returns A promise which resolves to the newly created target model instance
   */
  create(targetModelData: Partial<T>, options?: Options): Promise<T> {
    throw new Error('Method not implemented.');
  }
  /**
   * Build a target model instance
   * @param targetModelData The target model data
   * @returns A promise of the created model instance
   */
  build(targetModelData: DataObject<T>): Promise<T> {
    throw new Error('Method not implemented.');
  }
  /**
   * Find a related entity by id
   * @param id The foreign key
   * @param options Options for the operation
   * @returns A promise of an entity found for the id
   */
  findById(id: ID, filter?: Filter | undefined, options?: Options): Promise<T> {
    throw new Error('Method not implemented.');
  }
  /**
   * Update a related entity by foreign key
   * @param data Data attributes to be updated
   * @param id Value for the foreign key
   * @param options Options for the operation
   * @returns Promise<true> if the entity is updated, otherwise
   * Promise<false>
   */
  updateById(id: ID, data: Partial<T>, options?: Options): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  /**
   * Delete a related entity by id
   * @param id Value for the entity foreign key
   * @param options Options for the operation
   * @returns Promise<true> if an entity is deleted for the id, otherwise
   * Promise<false>
   */
  deleteById(id: ID, options?: Options): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  /**
   * Check if the related entity exists for the given foreign key
   * @param id Value for the entity foreign key
   * @param options Options for the operation
   * @returns Promise<true> if an entity exists for the id, otherwise
   * Promise<false>
   */
  exists(id: ID, options?: Options): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  save(entity: DataObject<T>, options?: Options): Promise<T | null> {
    throw new Error('Method not implemented.');
  }
  update(entity: DataObject<T>, options?: Options): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  delete(entity: DataObject<T>, options?: Options): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  replaceById(
    id: ID,
    data: DataObject<T>,
    options?: Options,
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  createAll(dataObjects: DataObject<T>[], options?: Options): Promise<T[]> {
    throw new Error('Method not implemented.');
  }
  find(filter?: Filter | undefined, options?: Options): Promise<T[]> {
    throw new Error('Method not implemented.');
  }
  updateAll(
    dataObject: DataObject<T>,
    where?: Where | undefined,
    options?: Options,
  ): Promise<number> {
    throw new Error('Method not implemented.');
  }
  deleteAll(where?: Where | undefined, options?: Options): Promise<number> {
    throw new Error('Method not implemented.');
  }
  count(where?: Where | undefined, options?: Options): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
