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
import {cloneDeep, isArray} from 'lodash';

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
   * @param sourceInstance the source model instance
   * @param targetRepository the related target model repository instance
   * @param foreignKeyName the foreign key name to constrain the target repository
   * instance
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
    return await this.targetRepository.create(
      constrainDataObject(targetModelData, this.constraint) as Partial<T>,
      options,
    );
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
    throw new Error(
      `Method is not supported via HasMany relations. Use ${
        this.targetRepository.entityClass.name
      }'s findById CRUD method directly.`,
    );
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
    throw new Error(
      `Method is not supported via HasMany relations. Use ${
        this.targetRepository.entityClass.name
      }'s updateById CRUD method directly.`,
    );
  }
  /**
   * Delete a related entity by id
   * @param id Value for the entity foreign key
   * @param options Options for the operation
   * @returns Promise<true> if an entity is deleted for the id, otherwise
   * Promise<false>
   */
  deleteById(id: ID, options?: Options): Promise<boolean> {
    throw new Error(
      `Method is not supported via HasMany relations. Use ${
        this.targetRepository.entityClass.name
      }'s deleteById CRUD method directly.`,
    );
  }
  /**
   * Check if the related entity exists for the given foreign key
   * @param id Value for the entity foreign key
   * @param options Options for the operation
   * @returns Promise<true> if an entity exists for the id, otherwise
   * Promise<false>
   */
  exists(id: ID, options?: Options): Promise<boolean> {
    throw new Error(
      `Method is not supported via HasMany relations. Use ${
        this.targetRepository.entityClass.name
      }'s exists CRUD method directly.`,
    );
  }

  async save(entity: DataObject<T>, options?: Options): Promise<T | null> {
    return await this.targetRepository.save(
      constrainDataObject(entity, this.constraint) as T,
      options,
    );
  }
  async update(entity: DataObject<T>, options?: Options): Promise<boolean> {
    return await this.targetRepository.update(
      constrainDataObject(entity, this.constraint) as T,
      options,
    );
  }
  async delete(entity: DataObject<T>, options?: Options): Promise<boolean> {
    return await this.targetRepository.delete(
      constrainDataObject(entity, this.constraint) as T,
      options,
    );
  }
  replaceById(
    id: ID,
    data: DataObject<T>,
    options?: Options,
  ): Promise<boolean> {
    throw new Error(
      `Method is not supported via HasMany relations. Use ${
        this.targetRepository.entityClass.name
      }'s replaceById CRUD method directly`,
    );
  }
  async createAll(
    dataObjects: DataObject<T>[],
    options?: Options,
  ): Promise<T[]> {
    return await this.targetRepository.createAll(
      constrainDataObject(dataObjects, this.constraint) as Partial<T>[],
      options,
    );
  }
  async find(filter?: Filter | undefined, options?: Options): Promise<T[]> {
    return await this.targetRepository.find(
      constrainFilter(filter, this.constraint),
      options,
    );
  }
  async updateAll(
    dataObject: DataObject<T>,
    where?: Where | undefined,
    options?: Options,
  ): Promise<number> {
    return await this.targetRepository.updateAll(
      constrainDataObject(dataObject, this.constraint) as Partial<T>,
      where,
      options,
    );
  }
  async deleteAll(
    where?: Where | undefined,
    options?: Options,
  ): Promise<number> {
    return await this.targetRepository.deleteAll(
      constrainWhere(where, this.constraint),
      options,
    );
  }
  async count(where?: Where | undefined, options?: Options): Promise<number> {
    return await this.targetRepository.count(
      constrainWhere(where, this.constraint),
      options,
    );
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
 * A utility function which takes a filter and enforces constraint(s)
 * on it
 * @param originalFilter the filter to apply the constrain(s) to
 * @param constraint the constraint which is to be applied on the filter
 * @returns Filter the modified filter with the constraint, otherwise
 * the original filter
 */
export function constrainWhere(
  originalWhere: Where | undefined,
  constraint: AnyObject,
): Where {
  let constrainedWhere = new WhereBuilder();
  for (const c in constraint) {
    constrainedWhere.eq(c, constraint[c]);
  }
  if (originalWhere) {
    constrainedWhere.where = constrainedWhere.and(originalWhere).where;
  }
  return constrainedWhere.where;
}

function constrainDataObject<T extends Entity>(
  originalData: DataObject<T>,
  constraint: AnyObject,
): DataObject<T>;

function constrainDataObject<T extends Entity>(
  originalData: DataObject<T>[],
  constraint: AnyObject,
): DataObject<T>[];
/**
 * A utility function which takes a model instance data and enforces constraint(s)
 * on it
 * @param originalData the model data to apply the constrain(s) to
 * @param constraint the constraint which is to be applied on the filter
 * @returns the modified data with the constraint, otherwise
 * the original instance data
 */
// tslint:disable-next-line:no-any
function constrainDataObject(originalData: any, constraint: any): any {
  let constrainedData = cloneDeep(originalData);
  if (typeof originalData === 'object') {
    addConstraintToDataObject(constraint, constrainedData);
  } else if (isArray(originalData)) {
    for (const data in originalData) {
      addConstraintToDataObject(constraint, constrainedData);
    }
  }
  return constrainedData;

  // tslint:disable-next-line:no-any
  function addConstraintToDataObject(constrainObject: any, modelData: any) {
    for (const c in constraint) {
      if (constrainedData[c]) {
        console.warn(
          'Overwriting %s with %s',
          constrainedData[c],
          constraint[c],
        );
      }
      constrainedData[c] = constraint[c];
    }
  }
}
