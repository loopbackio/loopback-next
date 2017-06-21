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
  get?: any;
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
  scope: Filter;
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
   * Sorting order for matched entities
   */
  order?: Order[];
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
