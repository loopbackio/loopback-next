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
