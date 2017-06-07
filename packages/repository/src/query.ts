// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Any} from './common-types';

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

export interface Condition {
  eq?: Any;
  neq?: Any;
  gt?: Any;
  get?: Any;
  lt?: Any;
  lte?: Any;
  inq?: Any[];
  between?: Any[];
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
  [property: string]: Condition | Any; // Other criteria
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
  where?: Where;
  fields?: Fields;
  order?: Order[];
  limit?: number;
  skip?: number;
  offset?: number;
  include?: Inclusion[];
}
