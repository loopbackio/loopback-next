// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AnyType} from './common';

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
  eq?: AnyType;
  neq?: AnyType;
  gt?: AnyType;
  get?: AnyType;
  lt?: AnyType;
  lte?: AnyType;
  inq?: AnyType[];
  between?: AnyType[];
  exists?: boolean;
  and?: Where[];
  or?: Where[];
}

/**
 * Where object
 */
export interface Where {
  and?: Where[]; // AND
  or?: Where[]; // OR
  [property: string]: Condition | AnyType; // Other criteria
}

/**
 * Order by direction
 */
export type Direction = 'ASC' | 'DESC';

/**
 * Order by
 */
export interface Order {
  [property: string]: Direction;
}

/**
 * Selection of fields
 */
export interface Fields {
  [property: string]: boolean;
}

/**
 * Inclusion of related items
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
