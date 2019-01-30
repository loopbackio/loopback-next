// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AnyObject} from './common-types';
import * as assert from 'assert';

// tslint:disable:no-any

const nonWhereFields = [
  'fields',
  'order',
  'limit',
  'skip',
  'offset',
  'include',
];

const filterFields = ['where', ...nonWhereFields];

/**
 * Operators for where clauses
 */
export type Operators =
  | 'eq' // Equal
  | 'neq' // Not Equal
  | 'gt' // >
  | 'gte' // >=
  | 'lt' // <
  | 'lte' // <=
  | 'inq' // IN
  | 'nin' // NOT IN
  | 'between' // BETWEEN [val1, val2]
  | 'exists'
  | 'and' // AND
  | 'or' // OR
  | 'like' // LIKE
  | 'nlike' // NOT LIKE
  | 'ilike' // ILIKE'
  | 'nilike' // NOT ILIKE
  | 'regexp'; // REGEXP'

/**
 * Matching predicate comparison
 */
export type PredicateComparison<PT> = {
  eq?: PT;
  neq?: PT;
  gt?: PT;
  gte?: PT;
  lt?: PT;
  lte?: PT;
  inq?: PT[];
  nin?: PT[];
  between?: [PT, PT];
  exists?: boolean;
  like?: PT;
  nlike?: PT;
  ilike?: PT;
  nilike?: PT;
  regexp?: string | RegExp;
  // [extendedOperation: string]: any;
};

/**
 * Value types for `{propertyName: value}`
 */
export type ShortHandEqualType = string | number | boolean | Date;

/**
 * Key types of a given model, excluding operators
 */
export type KeyOf<MT extends object> = Exclude<
  Extract<keyof MT, string>,
  Operators
>;

/**
 * Condition clause
 * For example:
 * ```ts
 * {
 *   name: {inq: ['John', 'Mary']},
 *   status: 'ACTIVE',
 *   age: {gte: 40}
 * }
 * ```
 */
export type Condition<MT extends object> = {
  [P in KeyOf<MT>]?:
    | PredicateComparison<MT[P]> // {x: {lt: 1}}
    | (MT[P] & ShortHandEqualType) // {x: 1},
};

/**
 * Where clause
 * For example:
 * ```ts
 * {
 *   name: {inq: ['John', 'Mary']},
 *   status: 'ACTIVE'
 *   and: [...],
 *   or: [...],
 * }
 * ```
 */
export type Where<MT extends object = AnyObject> =
  | Condition<MT>
  | AndClause<MT>
  | OrClause<MT>;

/**
 * And clause
 * For example:
 * ```ts
 * {
 *   and: [...],
 * }
 * ```
 */
export interface AndClause<MT extends object> {
  and: Where<MT>[];
}

/**
 * Or clause
 * For example:
 * ```ts
 * {
 *   or: [...],
 * }
 * ```
 */
export interface OrClause<MT extends object> {
  or: Where<MT>[];
}

/**
 * Order by direction
 */
export type Direction = 'ASC' | 'DESC';

/**
 * Order by
 *
 * Example:
 * `{afieldname: 'ASC'}`
 */
export type Order<MT = AnyObject> = {[P in keyof MT]: Direction};

/**
 * Selection of fields
 *
 * Example:
 * `{afieldname: true}`
 */
export type Fields<MT = AnyObject> = {[P in keyof MT]?: boolean};

/**
 * Inclusion of related items
 *
 * Note: scope means filter on related items
 *
 * Example:
 * `{relation: 'aRelationName', scope: {<AFilterObject>}}`
 */
export interface Inclusion<MT extends object = AnyObject> {
  relation: string;
  scope?: Filter<MT>;
}

/**
 * Query filter object
 */
export interface Filter<MT extends object = AnyObject> {
  /**
   * The matching criteria
   */
  where?: Where<MT>;
  /**
   * To include/exclude fields
   */
  fields?: Fields<MT>;
  /**
   * Sorting order for matched entities. Each item should be formatted as
   * `fieldName ASC` or `fieldName DESC`.
   * For example: `['f1 ASC', 'f2 DESC', 'f3 ASC']`.
   *
   * We might want to use `Order` in the future. Keep it as `string[]` for now
   * for compatibility with LoopBack 3.x.
   */
  order?: string[];
  /**
   * Maximum number of entities
   */
  limit?: number;
  /**
   * Skip N number of entities
   */
  skip?: number;
  /**
   * Offset N number of entities. An alias for `skip`
   */
  offset?: number;
  /**
   * To include related objects
   */
  include?: Inclusion<MT>[];
}

/**
 * TypeGuard for Filter
 * @param candidate
 */
export function isFilter<MT extends object>(
  candidate: any,
): candidate is Filter<MT> {
  if (typeof candidate !== 'object') return false;
  for (const key in candidate) {
    if (!filterFields.includes(key)) {
      return false;
    }
  }
  return true;
}

/**
 * A builder for Where object. It provides fluent APIs to add clauses such as
 * `and`, `or`, and other operators.
 *
 * @example
 * ```ts
 * const whereBuilder = new WhereBuilder();
 * const where = whereBuilder
 *   .eq('a', 1)
 *   .and({x: 'x'}, {y: {gt: 1}})
 *   .and({b: 'b'}, {c: {lt: 1}})
 *   .or({d: 'd'}, {e: {neq: 1}})
 *   .build();
 * ```
 */
export class WhereBuilder<MT extends object = AnyObject> {
  where: Where<MT>;

  constructor(w?: Where<MT>) {
    this.where = w || {};
  }

  private add(w: Where<MT>): this {
    for (const k of Object.keys(w)) {
      if (k in this.where) {
        // Found conflicting keys, create an `and` operator to join the existing
        // conditions with the new one
        const where = {and: [this.where, w]};
        this.where = where;
        return this;
      }
    }
    // Merge the where items
    this.where = Object.assign(this.where, w);
    return this;
  }

  /**
   * @deprecated
   * Starting from TypeScript 3.2, we don't have to cast any more. This method
   * should be considered as `deprecated`.
   *
   * Cast an `and`, `or`, or condition clause to Where
   * @param clause And/Or/Condition clause
   */
  cast(clause: AndClause<MT> | OrClause<MT> | Condition<MT>): Where<MT> {
    return clause;
  }

  /**
   * Add an `and` clause.
   * @param w One or more where objects
   */
  and(...w: (Where<MT> | Where<MT>[])[]): this {
    let clauses: Where<MT>[] = [];
    w.forEach(where => {
      clauses = clauses.concat(Array.isArray(where) ? where : [where]);
    });
    return this.add({and: clauses});
  }

  /**
   * Add an `or` clause.
   * @param w One or more where objects
   */
  or(...w: (Where<MT> | Where<MT>[])[]): this {
    let clauses: Where<MT>[] = [];
    w.forEach(where => {
      clauses = clauses.concat(Array.isArray(where) ? where : [where]);
    });
    return this.add({or: clauses});
  }

  /**
   * Add an `=` condition
   * @param key Property name
   * @param val Property value
   */
  eq<K extends KeyOf<MT>>(key: K, val: MT[K]): this {
    const w: Where<MT> = {};
    w[key] = val;
    return this.add(w);
  }

  /**
   * Add a `!=` condition
   * @param key Property name
   * @param val Property value
   */
  neq<K extends KeyOf<MT>>(key: K, val: MT[K]): this {
    const w: Where<MT> = {};
    w[key] = {neq: val};
    return this.add(w);
  }

  /**
   * Add a `>` condition
   * @param key Property name
   * @param val Property value
   */
  gt<K extends KeyOf<MT>>(key: K, val: MT[K]): this {
    const w: Where<MT> = {};
    w[key] = {gt: val};
    return this.add(w);
  }

  /**
   * Add a `>=` condition
   * @param key Property name
   * @param val Property value
   */
  gte<K extends KeyOf<MT>>(key: K, val: MT[K]): this {
    const w: Where<MT> = {};
    w[key] = {gte: val};
    return this.add(w);
  }

  /**
   * Add a `<` condition
   * @param key Property name
   * @param val Property value
   */
  lt<K extends KeyOf<MT>>(key: K, val: MT[K]): this {
    const w: Where<MT> = {};
    w[key] = {lt: val};
    return this.add(w);
  }

  /**
   * Add a `<=` condition
   * @param key Property name
   * @param val Property value
   */
  lte<K extends KeyOf<MT>>(key: K, val: MT[K]): this {
    const w: Where<MT> = {};
    w[key] = {lte: val};
    return this.add(w);
  }

  /**
   * Add a `inq` condition
   * @param key Property name
   * @param val An array of property values
   */
  inq<K extends KeyOf<MT>>(key: K, val: MT[K][]): this {
    const w: Where<MT> = {};
    w[key] = {inq: val};
    return this.add(w);
  }

  /**
   * Add a `nin` condition
   * @param key Property name
   * @param val An array of property values
   */
  nin<K extends KeyOf<MT>>(key: K, val: MT[K][]): this {
    const w: Where<MT> = {};
    w[key] = {nin: val};
    return this.add(w);
  }

  /**
   * Add a `between` condition
   * @param key Property name
   * @param val1 Property value lower bound
   * @param val2 Property value upper bound
   */
  between<K extends KeyOf<MT>>(key: K, val1: MT[K], val2: MT[K]): this {
    const w: Where<MT> = {};
    w[key] = {between: [val1, val2]};
    return this.add(w);
  }

  /**
   * Add a `exists` condition
   * @param key Property name
   * @param val Exists or not
   */
  exists<K extends KeyOf<MT>>(key: K, val?: boolean): this {
    const w: Where<MT> = {};
    w[key] = {exists: !!val || val == null};
    return this.add(w);
  }
  /**
   * Add a where object. For conflicting keys with the existing where object,
   * create an `and` clause.
   * @param where Where filter
   */
  impose(where: Where<MT>): this {
    if (!this.where) {
      this.where = where || {};
    } else {
      this.add(where);
    }
    return this;
  }

  /**
   * Get the where object
   */
  build() {
    return this.where;
  }
}

/**
 * A builder for Filter. It provides fleunt APIs to add clauses such as
 * `fields`, `order`, `where`, `limit`, `offset`, and `include`.
 *
 * @example
 * ```ts
 * const filterBuilder = new FilterBuilder();
 * const filter = filterBuilder
 *   .fields('id', a', 'b')
 *   .limit(10)
 *   .offset(0)
 *   .order(['a ASC', 'b DESC'])
 *   .where({id: 1})
 *   .build();
 * ```
 */
export class FilterBuilder<MT extends object = AnyObject> {
  filter: Filter<MT>;

  constructor(f?: Filter<MT>) {
    this.filter = f || {};
  }

  /**
   * Set `limit`
   * @param limit Maximum number of records to be returned
   */
  limit(limit: number): this {
    assert(limit >= 1, `Limit ${limit} must a positive number`);
    this.filter.limit = limit;
    return this;
  }

  /**
   * Set `offset`
   * @param offset Offset of the number of records to be returned
   */
  offset(offset: number): this {
    this.filter.offset = offset;
    return this;
  }

  /**
   * Alias to `offset`
   * @param skip
   */
  skip(skip: number): this {
    return this.offset(skip);
  }

  /**
   * Describe what fields to be included/excluded
   * @param f A field name to be included, an array of field names to be
   * included, or an Fields object for the inclusion/exclusion
   */
  fields(...f: (Fields<MT> | (keyof MT)[] | keyof MT)[]): this {
    if (!this.filter.fields) {
      this.filter.fields = {};
    }
    const fields = this.filter.fields;
    for (const field of f) {
      if (Array.isArray(field)) {
        (field as (keyof MT)[]).forEach(i => (fields[i] = true));
      } else if (typeof field === 'string') {
        fields[field as keyof MT] = true;
      } else {
        Object.assign(fields, field);
      }
    }
    return this;
  }

  private validateOrder(order: string) {
    assert(order.match(/^[^\s]+( (ASC|DESC))?$/), 'Invalid order: ' + order);
  }

  /**
   * Describe the sorting order
   * @param o A field name with optional direction, an array of field names,
   * or an Order object for the field/direction pairs
   */
  order(...o: (string | string[] | Order<MT>)[]): this {
    if (!this.filter.order) {
      this.filter.order = [];
    }
    o.forEach(order => {
      if (typeof order === 'string') {
        this.validateOrder(order);
        if (!order.endsWith(' ASC') && !order.endsWith(' DESC')) {
          order = order + ' ASC';
        }
        this.filter.order!.push(order);
        return this;
      }
      if (Array.isArray(order)) {
        order.forEach(this.validateOrder);
        order = order.map(i => {
          if (!i.endsWith(' ASC') && !i.endsWith(' DESC')) {
            i = i + ' ASC';
          }
          return i;
        });
        this.filter.order = this.filter.order!.concat(order);
        return this;
      }
      for (const i in order) {
        this.filter.order!.push(`${i} ${order[i]}`);
      }
    });
    return this;
  }

  /**
   * Declare `include`
   * @param i A relation name, an array of relation names, or an `Inclusion`
   * object for the relation/scope definitions
   */
  include(...i: (string | string[] | Inclusion<MT>)[]): this {
    if (this.filter.include == null) {
      this.filter.include = [];
    }
    for (const include of i) {
      if (typeof include === 'string') {
        this.filter.include.push({relation: include});
      } else if (Array.isArray(include)) {
        for (const inc of include) this.filter.include.push({relation: inc});
      } else {
        this.filter.include!.push(include);
      }
    }
    return this;
  }

  /**
   * Declare a where clause
   * @param w Where object
   */
  where(w: Where<MT>): this {
    this.filter.where = w;
    return this;
  }

  /**
   * Add a Filter or Where constraint object. If it is a filter object, create
   * an `and` clause for conflicting keys with its where object. For any other
   * properties, throw an error. If it's not a Filter, coerce it to a filter,
   * and carry out the same logic.
   *
   * @param constraint a constraint object to merge with own filter object
   */
  impose(constraint: Filter<MT> | Where<MT>): this {
    if (!this.filter) {
      // if constraint is a Where, turn into a Filter
      if (!isFilter(constraint)) {
        constraint = {where: constraint};
      }
      this.filter = (constraint as Filter<MT>) || {};
    } else {
      if (isFilter(constraint)) {
        // throw error if imposed Filter has non-where fields
        for (const key of Object.keys(constraint)) {
          if (nonWhereFields.includes(key)) {
            throw new Error(
              'merging strategy for selection, pagination, and sorting not implemented',
            );
          }
        }
      }
      this.filter.where = isFilter(constraint)
        ? new WhereBuilder(this.filter.where).impose(constraint.where!).build()
        : new WhereBuilder(this.filter.where).impose(constraint).build();
    }
    return this;
  }

  /**
   * Return the filter object
   */
  build() {
    return this.filter;
  }
}

/**
 * Get nested properties by path
 * @param value Value of an object
 * @param path Path to the property
 */
function getDeepProperty(value: AnyObject, path: string): any {
  const props = path.split('.');
  for (const p of props) {
    value = value[p];
    if (value == null) {
      return null;
    }
  }
  return value;
}

export function filterTemplate(strings: TemplateStringsArray, ...keys: any[]) {
  return function filter(ctx: AnyObject) {
    const tokens = [strings[0]];
    keys.forEach((key, i) => {
      if (
        typeof key === 'object' ||
        typeof key === 'boolean' ||
        typeof key === 'number'
      ) {
        tokens.push(JSON.stringify(key), strings[i + 1]);
        return;
      }
      const value = getDeepProperty(ctx, key);
      tokens.push(JSON.stringify(value), strings[i + 1]);
    });
    const result = tokens.join('');
    try {
      return JSON.parse(result);
    } catch (e) {
      throw new Error('Invalid JSON: ' + result);
    }
  };
}
