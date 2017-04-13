import {Entity, Model} from './model';

/**
 * Operators for where clauses
 */
enum Operators {
  eq, // Equal
  neq, // Not Equal
  gt, // >
  gte, // >=
  lt, // <
  lte, // <=
  inq, // IN
  between, // BETWEEN [val1, val2]
  exists,
  and, // AND
  or // OR
}

/**
 * Where object
 */
export class Where {
  and?: Where[]; // AND
  or?: Where[]; // OR
  [property: string]: any; // Other criteria
}

/**
 * Order by direction
 */
export type Direction = 'ASC' | 'DESC';

/**
 * Type alias for options object
 */
export type Options = Object;

/**
 * Order by
 */
export class Order {
  [property: string]: Direction;
}

/**
 * Selection of fields
 */
export class Fields {
  [property: string]: boolean;
}

/**
 * Inclusion of related items
 */
export class Inclusion {
  relation: string;
  scope: Filter
}

/**
 * Query filter object
 */
export class Filter {
  where?: Where;
  fields?: Fields;
  order?: Order[];
  limit?: number;
  skip?: number;
  offset?: number;
  include?: Inclusion[];
}

export interface Repository<T extends Model> {
}

/**
 * Basic CRUD operations for value objects (without IDs)
 */
export interface ValueObjectRepository<T extends Model> extends Repository<T> {
  /**
   * Create a new record
   * @param value
   * @param options
   */
  create(value: T, options?: Options): Promise<T>;

  /**
   * Find matching records
   * @param filter
   * @param options
   */
  find(filter?: Filter, options?: Options): Promise<T[]>;

  /**
   * Updating matching records with attributes from the data object
   * @param data
   * @param where
   * @param options
   */
  updateAll(data: {}, where?: Where, options?: Options): Promise<number>;

  /**
   * Delete matching records
   * @param where
   * @param options
   */
  deleteAll(where?: Where, options?: Options): Promise<number>;

  /**
   * Count matching records
   * @param where
   * @param options
   */
  count(where?: Where, options?: Options): Promise<number>;
}

/**
 * Base interface for a repository
 */
export interface EntityRepository<T extends Entity, ID> extends Repository<T> {
}

/**
 * CRUD repository
 */
export interface EntityCrudRepository<T extends Entity, ID>
extends EntityRepository<T, ID> {
  /**
   * Create an entity
   * @param entity
   * @param options
   */
  create(entity: T, options?: Options): Promise<T>;

  /**
   * Create all entities
   * @param entities
   * @param options
   */
  createAll(entities: T[], options?: Options): Promise<T[]>;

  /**
   *
   * @param entity
   * @param options
   */
  save(entity: T, options?: Options): Promise<T>;

  /**
   *
   * @param filter
   * @param options
   */
  find(filter?: Filter, options?: Options): Promise<T[]>;

  /**
   *
   * @param id
   * @param options
   */
  findById(id: ID, options?: Options): Promise<T[]>;

  /**
   *
   * @param entity
   * @param options
   */
  update(entity: T, options?: Options): Promise<boolean>;

  /**
   *
   * @param entity
   * @param options
   */
  delete(entity: T, options?: Options): Promise<boolean>;

  /**
   *
   * @param data
   * @param where
   * @param options
   */
  updateAll(data: {}, where?: Where, options?: Options): Promise<number>;

  /**
   *
   * @param data
   * @param id
   * @param options
   */
  updateById(id: ID, data: {}, options?: Options): Promise<number>;

  /**
   *
   * @param data
   * @param id
   * @param options
   */
  replaceById(id: ID, data: {}, options?: Options): Promise<number>;

  /**
   *
   * @param where
   * @param options
   */
  deleteAll(where?: Where, options?: Options): Promise<number>;

  /**
   *
   * @param id
   * @param options
   */
  deleteById(id: ID, options?: Options): Promise<number>;

  /**
   * Count the matching records
   * @param where
   * @param options
   */
  count(where?: Where, options?: Options): Promise<number>;
}

/**
 * Repository implementation
 */
export class CrudRepositoryImpl<T extends Entity, ID>
implements EntityCrudRepository<T, ID> {

  constructor(public connector: any, public model: T) {

  }

  create(entity: T, options?: Options): Promise<T> {
    return this.connector.create(this.model, entity, options);
  }

  createAll(entities: T[], options?: Options): Promise<T[]> {
    return this.connector.create(this.model, entities, options);
  }

  save(entity: T, options?: Options): Promise<T> {
    return this.connector.save(this.model, entity, options);
  }

  find(filter?: Filter, options?: Options): Promise<T[]> {
    return this.connector.find(this.model, filter, options);
  }

  findById(id: ID, options?: Options): Promise<T[]> {
    return this.connector.findById(this.model, id, options);
  }

  update(entity: T, options?: Options): Promise<boolean> {
    return this.connector.updateById(this.model, entity.getId(), options);
  }

  delete(entity: T, options?: Options): Promise<boolean> {
    return this.connector.deleteById(this.model, entity.getId(), options);
  }

  updateAll(data: {}, where?: Where, options?: Options): Promise<number> {
    return this.connector.update(this.model, where, options);
  }

  updateById(id: ID, data: {}, options?: Options): Promise<number> {
    return this.connector.updateById(this.model, id, options);
  }

  replaceById(id: ID, data: {}, options?: Options): Promise<number> {
    return this.connector.replaceById(this.model, id, options);
  }

  deleteAll(where?: Where, options?: Options): Promise<number> {
    return this.connector.delete(this.model, where, options);
  }

  deleteById(id: ID, options?: Options): Promise<number> {
    return this.connector.deleteById(this.model, id, options);
  }

  count(where?: Where, options?: Options): Promise<number> {
    return this.connector.count(this.model, where, options);
  }
}