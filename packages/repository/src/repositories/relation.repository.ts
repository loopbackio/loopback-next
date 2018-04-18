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
  extends Repository<T> {
  /**
   * Create a target model instance
   * @param targetModelData The target model data
   * @param options Options for the operation
   * @returns A promise which resolves to the newly created target model instance
   */
  create(targetModelData: DataObject<T>, options?: Options): Promise<T>;

  /**
   * Build a target model instance
   * @param targetModelData The target model data
   * @returns A promise of the created model instance
   */
  build(targetModelData: DataObject<T>): Promise<T>;

  /**
   * Find a related entity by id
   * @param id The foreign key
   * @param options Options for the operation
   * @returns A promise of an entity found for the id
   */
  findById(id: ID, filter?: Filter, options?: Options): Promise<T>;

  /**
   * Update a related entity by foreign key
   * @param data Data attributes to be updated
   * @param id Value for the foreign key
   * @param options Options for the operation
   * @returns Promise<true> if the entity is updated, otherwise
   * Promise<false>
   */
  updateById(id: ID, data: DataObject<T>, options?: Options): Promise<boolean>;

  /**
   * Delete a related entity by id
   * @param id Value for the entity foreign key
   * @param options Options for the operation
   * @returns Promise<true> if an entity is deleted for the id, otherwise
   * Promise<false>
   */
  deleteById(id: ID, options?: Options): Promise<boolean>;

  /**
   * Check if the related entity exists for the given foreign key
   * @param id Value for the entity foreign key
   * @param options Options for the operation
   * @returns Promise<true> if an entity exists for the id, otherwise
   * Promise<false>
   */
  exists(id: ID, options?: Options): Promise<boolean>;
}

export class DefaultHasManyEntityCrudRepository<T extends Entity, ID>
  implements HasManyEntityCrudRepository<T, ID> {
  /**
   * Constructor of DefaultCrudRepository
   * @param targetRepo a repository of the target model
   * @param foreignKey the constraints to scope target repo CRUD methods
   */
  constructor(
    public targetRepo: DefaultCrudRepository<T, ID>,
    public primaryKey: ID,
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
    options = Object.assign(options, this.buildFilter());
    return this.targetRepo.create(targetModelData, options);
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
    filter = Object.assign(filter, this.buildFilter());
    return this.targetRepo.findById(id, filter, options);
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
    options = Object.assign(options, this.buildFilter());
    return this.targetRepo.updateById(id, data, options);
  }
  /**
   * Delete a related entity by id
   * @param id Value for the entity foreign key
   * @param options Options for the operation
   * @returns Promise<true> if an entity is deleted for the id, otherwise
   * Promise<false>
   */
  deleteById(id: ID, options?: Options): Promise<boolean> {
    options = Object.assign(options, this.buildFilter());
    return this.targetRepo.deleteById(id, options);
  }
  /**
   * Check if the related entity exists for the given foreign key
   * @param id Value for the entity foreign key
   * @param options Options for the operation
   * @returns Promise<true> if an entity exists for the id, otherwise
   * Promise<false>
   */
  exists(id: ID, options?: Options): Promise<boolean> {
    options = Object.assign(options, this.buildFilter());
    return this.targetRepo.exists(id, options);
  }
  /**
   * A function to constrain all CRUD methods with foreign key
   * @returns Where a where filter which sets
   */
  buildFilter(): Where {
    const targetModel = this.targetRepo.modelClass;
    let pk = this.primaryKey;
    const whereFilter: Where = {};
    const idName = targetModel.getIdName();
    whereFilter[idName] = pk;
    return whereFilter;
  }
}
{
}
