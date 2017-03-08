import {Entity} from './model';

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

/**
 * Base interface for a repository
 */
export interface Repository<T extends Entity, ID> {
}

/**
 * CRUD repository
 */
export interface CrudRepository<T extends Entity, ID>
extends Repository<T, ID> {
  /**
   *
   * @param entity
   * @param options
   */
  create(entity: T | T[], options?: Object): Promise<T | T[]>;

  /**
   *
   * @param entity
   * @param options
   */
  upsert(entity: T, options: Object): Promise<T>;

  /**
   *
   * @param filter
   * @param options
   */
  find(filter?: Filter, options?: Object): Promise<T[]>;

  /**
   *
   * @param id
   * @param options
   */
  findById(id: ID, options?: Object): Promise<T[]>;

  /**
   *
   * @param entity
   * @param options
   */
  update(entity: T, options?: Object): Promise<boolean>;

  /**
   *
   * @param entity
   * @param options
   */
  delete(entity: T, options?: Object): Promise<boolean>;

  /**
   *
   * @param data
   * @param where
   * @param options
   */
  updateAll(data: any, where?: any, options?: Object): Promise<number>;

  /**
   *
   * @param data
   * @param id
   * @param options
   */
  updateById(data: any, id: ID, options?: Object): Promise<number>;

  /**
   *
   * @param where
   * @param options
   */
  deleteAll(where?: any, options?: Object): Promise<number>;

  /**
   *
   * @param id
   * @param options
   */
  deleteById(id: ID, options?: Object): Promise<number>;
}

/**
 * Repository implementation
 */
export class CrudRepositoryImpl<T extends Entity, ID> implements CrudRepository<T, ID> {

  constructor(public connector: any, public model: T) {

  }

  create(entity: T | T[], options?: Object): Promise<T | T[]> {
    return this.connector.create(this.model, entity, options);
  }

  upsert(entity: T, options: Object): Promise<T> {
    return this.connector.upsert(this.model, entity, options);
  }

  find(filter?: any, options?: Object): Promise<T[]> {
    return this.connector.find(this.model, filter, options);
  }

  findById(id: ID, options?: Object): Promise<T[]> {
    return this.connector.findById(this.model, id, options);
  }

  update(entity: T, options?: Object): Promise<boolean> {
    return this.connector.updateById(this.model, entity.getId(), options);
  }

  delete(entity: T, options?: Object): Promise<boolean> {
    return this.connector.deleteById(this.model, entity.getId(), options);
  }

  updateAll(data: any, where?: any, options?: Object): Promise<number> {
    return this.connector.update(this.model, where, options);
  }

  updateById(data: any, id: ID, options?: Object): Promise<number> {
    return this.connector.updateById(this.model, id, options);
  }

  deleteAll(where?: any, options?: Object): Promise<number> {
    return this.connector.delete(this.model, where, options);
  }

  deleteById(id: ID, options?: Object): Promise<number> {
    return this.connector.deleteById(this.model, id, options);
  }
}