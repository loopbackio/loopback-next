// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AnyObject} from './common-types';
import * as assert from 'assert';

// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// tslint:disable:no-any

/**
 * Operators for where clauses
 */
export enum Operators {
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
  or, // OR
}

/**
 * Matching condition
 */
export interface Condition {
  eq?: any;
  neq?: any;
  gt?: any;
  gte?: any;
  lt?: any;
  lte?: any;
  inq?: any[];
  between?: any[];
  exists?: boolean;
  and?: Where[];
  or?: Where[];
}

/**
 * Where object
 *
 * Examples:
 * `{afieldname: 'aName'}`
 * `{and: [{fieldone: 'one'}, {fieldtwo: 'two'}]}`
 * `{or: [{fieldone: 'one'}, {fieldtwo: 'two'}]}`
 */
export interface Where {
  and?: Where[]; // AND
  or?: Where[]; // OR
  [property: string]: Condition | any; // Other criteria
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
export interface Order {
  [property: string]: Direction;
}

/**
 * Selection of fields
 *
 * Example:
 * `{afieldname: true}`
 */
export interface Fields {
  [property: string]: boolean;
}

/**
 * Inclusion of related items
 *
 * Note: scope means filter on related items
 *
 * Example:
 * `{relation: 'aRelationName', scope: {<AFilterObject>}}`
 */
export interface Inclusion {
  relation: string;
  scope?: Filter;
}

/**
 * Query filter object
 */
export interface Filter {
  /**
   * The matching criteria
   */
  where?: Where;
  /**
   * To include/exclude fields
   */
  fields?: Fields;
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
  include?: Inclusion[];
}

export function isFilter(arg: any): arg is Filter {
  if (typeof arg === 'object') {
    const filterFields = [
      'where',
      'fields',
      'order',
      'limit',
      'skip',
      'offset',
      'include',
    ];
    for (const key in arg) {
      if (!filterFields.includes(key)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * A builder for Where object. It provides fleunt APIs to add clauses such as
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
export class WhereBuilder {
  where: Where;

  constructor(w?: Where) {
    this.where = w || {};
  }

  private add(w: Where): this {
    for (const k of Object.keys(w)) {
      if (k in this.where) {
        // Found conflicting keys, create an `and` operator to join the existing
        // conditions with the new one
        this.where = {and: [this.where, w]};
        return this;
      }
    }
    // Merge the where items
    this.where = Object.assign(this.where, w);
    return this;
  }

  /**
   * Add an `and` clause.
   * @param w One or more where objects
   */
  and(...w: (Where | Where[])[]): this {
    let clauses: Where[] = [];
    w.forEach(where => {
      clauses = clauses.concat(Array.isArray(where) ? where : [where]);
    });
    return this.add({and: clauses});
  }

  /**
   * Add an `or` clause.
   * @param w One or more where objects
   */
  or(...w: (Where | Where[])[]): this {
    let clauses: Where[] = [];
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
  eq(key: string, val: any): this {
    return this.add({[key]: val});
  }

  /**
   * Add a `!=` condition
   * @param key Property name
   * @param val Property value
   */
  neq(key: string, val: any): this {
    return this.add({[key]: {neq: val}});
  }

  /**
   * Add a `>` condition
   * @param key Property name
   * @param val Property value
   */
  gt(key: string, val: any): this {
    return this.add({[key]: {gt: val}});
  }

  /**
   * Add a `>=` condition
   * @param key Property name
   * @param val Property value
   */
  gte(key: string, val: any): this {
    return this.add({[key]: {gte: val}});
  }

  /**
   * Add a `<` condition
   * @param key Property name
   * @param val Property value
   */
  lt(key: string, val: any): this {
    return this.add({[key]: {lt: val}});
  }

  /**
   * Add a `<=` condition
   * @param key Property name
   * @param val Property value
   */
  lte(key: string, val: any): this {
    return this.add({[key]: {lte: val}});
  }

  /**
   * Add a `inq` condition
   * @param key Property name
   * @param val An array of property values
   */
  inq(key: string, val: any[]): this {
    return this.add({[key]: {inq: val}});
  }

  /**
   * Add a `between` condition
   * @param key Property name
   * @param val1 Property value lower bound
   * @param val2 Property value upper bound
   */
  between(key: string, val1: any, val2: any): this {
    return this.add({[key]: {between: [val1, val2]}});
  }

  /**
   * Add a `exists` condition
   * @param key Property name
   * @param val Exists or not
   */
  exists(key: string, val?: boolean): this {
    return this.add({[key]: {exists: !!val || val == null}});
  }
  /**
   * Add a where object. For conflicting keys with the existing where object,
   * create an `and` clause.
   * @param where Where filter
   */
  impose(where: Where): this {
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
export class FilterBuilder {
  filter: Filter;

  constructor(f?: Filter) {
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
  fields(...f: (Fields | string[] | string)[]): this {
    if (!this.filter.fields) {
      this.filter.fields = {};
    }
    f.forEach(field => {
      if (Array.isArray(field)) {
        field.forEach(i => (this.filter.fields![i] = true));
      } else if (typeof field === 'string') {
        this.filter.fields![field] = true;
      } else {
        Object.assign(this.filter.fields, field);
      }
    });
    return this;
  }

  private validateOrder(order: string) {
    assert(order.match(/^[^\s]+( (ASC|DESC))?$/), 'Invalid order: ' + order);
  }

  /**
   * Describe the sorting order
   * @param f A field name with optional direction, an array of field names,
   * or an Order object for the field/direction pairs
   */
  order(...o: (string | string[] | Order)[]): this {
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
  include(...i: (string | string[] | Inclusion)[]): this {
    if (!this.filter.include) {
      this.filter.include = [];
    }
    i.forEach(include => {
      if (typeof include === 'string') {
        this.filter.include!.push({relation: include});
      } else if (Array.isArray(include)) {
        include.forEach(inc => this.filter.include!.push({relation: inc}));
      } else {
        this.filter.include!.push(include);
      }
    });
    return this;
  }

  /**
   * Declare a where clause
   * @param w Where object
   */
  where(w: Where): this {
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
  impose(constraint: Filter | Where): this {
    if (!this.filter) {
      // if constraint is a Where, turn into a Filter
      if (!isFilter(constraint)) {
        constraint = {where: constraint};
      }
      this.filter = (constraint as Filter) || {};
    } else {
      if (isFilter(constraint)) {
        // throw error if imposed Filter has non-where fields
        Object.keys(constraint).forEach(key => {
          if (
            ['fields', 'order', 'limit', 'skip', 'offset', 'include'].includes(
              key,
            )
          ) {
            throw new Error(
              'merging strategy for selection, pagination, and sorting not implemented',
            );
          }
        });
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
