// Copyright The LoopBack Authors 2021. All Rights Reserved.
// Node module: @loopback/prisma
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AnyObject, Fields, Filter, Where} from '@loopback/repository';
import {
  Condition,
  Filter as PrismaFilter,
  WhereFilter as PrismaWhereFilter,
} from '../';
import {
  PrismaFilterConflictError,
  PrismaFilterInvalidLB4DirectionError,
  PrismaFilterUnsupportedLB4FilterOperatorError,
} from '../errors';
import {AndClause, NotClause, OrClause} from '../types';

/**
 * Converts a LoopBack 4 {@link @loopback/repository#Filter} to its Prisma
 * equivilant.
 *
 * @remarks
 * ## Filter Mapping
 *
 * | LoopBack 4   | Prisma  | Remarks
 * | ------------ | ------- | ----------------------------------------- |
 * | fields       | select  |                                           |
 * | include      | include |                                           |
 * | offset, skip | skip    | `skip` is ignored if `offset` is present. |
 * | limit        | take    |                                           |
 * | order        | orderBy |                                           |
 * | where        | where   |                                           |
 *
 * @see {@link lb4ToPrismaWhereFilter} for a more-detailed documentation on the
 * {@link Where} filter conversion.
 *
 * @typeParam MT key-value map of properties that will be converted, typically
 * a subclass of {@link @loopback/repository#Model}.
 * @param lb4Filter Target LoopBack 4 filter to convert.
 * @params options Filter processing configuration options.
 * @returns Type-compatible Prisma filter
 * @throws {@link PrismaFilterConflictError}
 * @throws {@link PrismaFilterInvalidLB4DirectionError}
 * @throws {@link PrismaFilterUnsupportedLB4FilterOperatorError}
 */
export function lb4ToPrismaFilter<MT extends object = AnyObject>(
  lb4Filter: Filter<MT>,
  options: {
    allowExtendedOperators?: boolean;
  } = {allowExtendedOperators: false},
): PrismaFilter<MT> {
  let prismaFilter: PrismaFilter = {};

  if (lb4Filter.fields && lb4Filter.include)
    throw new PrismaFilterConflictError(
      '`fields` and `include` cannot be used simultaneously in Prisma filters.',
    );

  // Fields filter mapping
  if (lb4Filter.fields) {
    // Required to dictate that the Prisma filter without "include" is being
    // created.
    prismaFilter = {select: undefined};
    prismaFilter.select = {};

    if (Array.isArray(lb4Filter.fields)) {
      for (const field of lb4Filter.fields) {
        prismaFilter.select[field] = true;
      }
    } else {
      for (const field of Object.keys(lb4Filter.fields) as Array<
        keyof Fields<MT>
      >) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        prismaFilter.select[field] = lb4Filter.fields[field]!;
      }
    }
  }

  // Inclusion filter mapping
  if (lb4Filter.include) {
    // Required to dictate that the Prisma filter without "select" is being
    // created.
    prismaFilter = {include: undefined};
    prismaFilter.include = {};

    for (const inclusion of lb4Filter.include) {
      if (typeof inclusion === 'string') prismaFilter.include[inclusion] = true;
      else
        prismaFilter.include[inclusion.relation] = inclusion.scope
          ? lb4ToPrismaFilter(inclusion.scope, options)
          : true;
    }
  }

  // Skip/offset and limit filter mapping
  if (lb4Filter.offset) prismaFilter.skip = lb4Filter.offset;
  else if (lb4Filter.skip) prismaFilter.skip = lb4Filter.skip;
  if (lb4Filter.limit) prismaFilter.take = lb4Filter.limit;

  // Order filter mapping
  if (lb4Filter.order) {
    prismaFilter.orderBy = [];
    for (const order of lb4Filter.order) {
      const [prop, rawDirection] = order.split(' ');

      const direction = rawDirection?.toLowerCase() ?? 'asc';

      if (!['asc', 'desc'].includes(direction))
        throw new PrismaFilterInvalidLB4DirectionError(direction);

      prismaFilter.orderBy.push({[prop]: direction as 'asc' | 'desc'});
    }

    // Collapse to the simpler syntax if possible.
    if (prismaFilter.orderBy.length === 1)
      prismaFilter.orderBy = prismaFilter.orderBy[0];
  }

  if (lb4Filter.where) {
    prismaFilter.where = lb4ToPrismaWhereFilter(lb4Filter.where, options);
  }

  return prismaFilter as PrismaFilter<MT>;
}

/**
 * Converts a LoopBack 4 {@link @loopback/repository#Where} filter to its Prisma
 * equivilant.
 *
 * @remarks
 * ## Where Filter Mapping
 *
 * | LoopBack 4          | Prisma       | Remarks                 |
 * | ------------------- | ------------ | ----------------------  |
 * | literal, eq         | literal      |                         |
 * | neq                 | not          |                         |
 * | gt                  | gt           |                         |
 * | gte                 | gte          |                         |
 * | lt                  | lt           |                         |
 * | lte                 | lte          |                         |
 * | between (exclusive) | lt + gt      |                         |
 * | inq                 | in           |                         |
 * | nin                 | NOT(in)      |                         |
 * | near                | N/A          |                         |
 * | like                | N/A          |                         |
 * | ilike               | N/A          |                         |
 * | regexp              | N/A          |                         |
 * | match               | search       |                         |
 *
 * ## Notes
 *
 * Only `and`, `or` or the model properties can appear as a direct object key of
 * {@link @loopback/repository#Where | Where}. All 3 types cannot appear at the
 * same time.
 *
 * @internalRemarks
 * There's a lot of hacky type casting going on due to incompatible types.
 * While there is test coverage, we'll need to look into fixing this.
 *
 * @typeParam MT key-value map of properties that will be converted, typically
 * a subclass of {@link @loopback/repository#Model}.
 * @param lb4Filter Target LoopBack 4 where filter to convert.
 * @params options Filter processing configuration options.
 * @returns Type-compatible Prisma where filter.
 * @throws {@link PrismaFilterConflictError}
 * @throws {@link PrismaFilterUnsupportedLB4FilterOperatorError}
 */
export function lb4ToPrismaWhereFilter<MT extends object = AnyObject>(
  lb4Filter: Where<MT>,
  options: {
    allowExtendedOperators?: boolean;
  } = {allowExtendedOperators: false},
): PrismaWhereFilter<MT> {
  const prismaFilter: PrismaWhereFilter = {};
  let prismaFilterPointer = prismaFilter;

  if (
    ('and' in lb4Filter || 'or' in lb4Filter) &&
    Object.keys(lb4Filter).length > 1
  )
    throw new PrismaFilterConflictError(
      '`and`, `or`, and model properties cannot be simultaneously the object keys of the LoopBack 4 Filter.',
    );

  if ('and' in lb4Filter)
    (prismaFilter as AndClause).AND = lb4Filter.and.map(filter =>
      lb4ToPrismaWhereFilter(filter, options),
    );
  else if ('or' in lb4Filter)
    (prismaFilter as OrClause).OR = lb4Filter.or.map(filter =>
      lb4ToPrismaWhereFilter(filter, options),
    );
  else {
    const props = Object.keys(lb4Filter) as Array<keyof typeof lb4Filter>;
    for (const prop of props) {
      const query = lb4Filter[prop];
      let propPointer = prop as keyof typeof prismaFilterPointer;

      const nestedProps = prop.split('.');

      if (nestedProps.length > 1)
        nestedProps.forEach((x, i) => {
          if (x === '') throw new Error();
          propPointer = x as keyof typeof prismaFilterPointer;
          if (i < nestedProps.length - 1) {
            prismaFilterPointer[propPointer] ??= {};
            prismaFilterPointer = prismaFilterPointer[propPointer];
          }
        });

      if (
        ['string', 'number', 'boolean'].includes(typeof query) ||
        query instanceof Date
      )
        (prismaFilterPointer as Condition)[propPointer] = query;
      else if ('eq' in query)
        (prismaFilterPointer as Condition)[propPointer] = {equals: query.eq};
      else if ('neq' in query)
        (prismaFilterPointer as Condition)[propPointer] = {not: query.neq};
      else if ('gt' in query)
        (prismaFilterPointer as Condition)[propPointer] = {gt: query.gt};
      else if ('gte' in query)
        (prismaFilterPointer as Condition)[propPointer] = {gte: query.gte};
      else if ('lt' in query)
        (prismaFilterPointer as Condition)[propPointer] = {lt: query.lt};
      else if ('lte' in query)
        (prismaFilterPointer as Condition)[propPointer] = {lte: query.lte};
      else if ('between' in query && query.between)
        (prismaFilterPointer as AndClause).AND = [
          {[propPointer]: {lt: query['between'][0]}},
        ];
      else if ('inq' in query)
        (prismaFilterPointer as Condition)[propPointer] = {in: query.inq};
      else if ('nin' in query)
        (prismaFilterPointer as NotClause).NOT = {
          [propPointer]: {in: query.nin},
        };
      else if ('match' in query)
        (prismaFilterPointer as Condition)[propPointer] = {search: query.match};
      else if (options.allowExtendedOperators)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        prismaFilterPointer[propPointer] = {[propPointer]: query};
      else throw new PrismaFilterUnsupportedLB4FilterOperatorError(prop);
    }
  }

  return prismaFilter as PrismaWhereFilter<MT>;
}
