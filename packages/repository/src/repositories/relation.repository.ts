import {DefaultCrudRepository, EntityCrudRepository} from '.';
import {
  Entity,
  Filter,
  AnyObject,
  Where,
  DataObject,
  Options,
  WhereBuilder,
} from '..';
import {cloneDeep} from 'lodash';

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

export class DefaultHasManyEntityCrudRepository<
  S extends Entity,
  T extends Entity,
  TargetRepository extends DefaultCrudRepository<T, typeof Entity.prototype.id>,
  ID
> implements HasManyEntityCrudRepository<T, ID> {
  public constraint: AnyObject = {};
  /**
   * Constructor of DefaultHasManyEntityCrudRepository
   * @param targetModel the target model class
   * @param targetId the constraints to scope target repo CRUD methods
   */
  constructor(
    public sourceInstance: S,
    public targetRepository: TargetRepository,
    public foreignKeyName: string,
  ) {
    let targetProp = this.targetRepository.entityClass.definition.properties[
      this.foreignKeyName
    ].type;
    this.constraint[
      this.foreignKeyName
    ] = sourceInstance.getId() as typeof targetProp;
    this.targetRepository = this.targetRepository;
  }
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
  async create(targetModelData: Partial<T>, options?: Options): Promise<T> {
    targetModelData = constrainDataObject(targetModelData, this.constraint);
    return await this.targetRepository.create(targetModelData, options);
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
  async findById(
    id: ID,
    filter?: Filter | undefined,
    options?: Options,
  ): Promise<T> {
    // throw new Error('Method not implemented.');
    filter = constrainFilter(filter, this.constraint);
    return await this.targetRepository.findById(id, filter);
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

/**
 * A utility function which takes a filter and enforces constraint(s)
 * on it
 * @param originalFilter the filter to apply the constrain(s) to
 * @param constraint the constraint which is to be applied on the filter
 * @returns Filter the modified filter with the constraint, otherwise
 * the original filter
 */
export function constrainFilter(
  originalFilter: Filter | undefined,
  constraint: AnyObject,
): Filter {
  let constrainedFilter: Filter = {};
  let constrainedWhere = new WhereBuilder();
  for (const c in constraint) {
    constrainedWhere.eq(c, constraint[c]);
  }
  if (originalFilter) {
    constrainedFilter = cloneDeep(originalFilter);
    if (originalFilter.where) {
      constrainedFilter.where = constrainedWhere.and(
        originalFilter.where,
      ).where;
    }
  } else if (originalFilter === undefined) {
    constrainedFilter.where = constrainedWhere.where;
  }
  return constrainedFilter;
}

/**
 * A utility function which takes a model instance data and enforces constraint(s)
 * on it
 * @param originalData the model data to apply the constrain(s) to
 * @param constraint the constraint which is to be applied on the filter
 * @returns DataObject<Target> the modified data with the constraint, otherwise
 * the original instance data
 */
export function constrainDataObject<Target extends Entity>(
  originalData: Partial<Target>,
  constraint: AnyObject,
): Partial<Target> {
  let constrainedData = cloneDeep(originalData);
  for (const c in constraint) {
    if (constrainedData[c]) {
      console.warn('Overwriting %s with %s', constrainedData[c], constraint[c]);
    }
    constrainedData[c] = constraint[c];
  }
  return constrainedData;
}
