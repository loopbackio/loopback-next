// import {AnyObject, Filter, Where} from '@loopback/repository';
// import {cloneDeep} from 'lodash';
// import {PrismaGenericTypes} from '../types';

// /**
//  * Converts a LoopBack 4 {@link @loopback/repository#Filter} to its Prisma
//  * equivilant.
//  *
//  * @remarks
//  * ## Filter Mapping
//  *
//  * | LoopBack 4   | Prisma  |
//  * | ------------ | ------- |
//  * | fields       | select  |
//  * | include      | include |
//  * | offset, skip | skip    |
//  * | limit        | take    |
//  * | order        | orderBy |
//  * | where        | where   |
//  *
//  * @see {@link lb4ToPrismaWhereFilter} for a more-detailed documentation on the
//  * {@link @loopback/repository#Where} filter conversion.
//  *
//  * @typeParam MT key-value map of properties that will be converted, typically
//  * a subclass of {@link @loopback/repository#Model}.
//  * @param lb4Filter Target LoopBack 4 filter to convert.
//  * @returns Type-compatible Prisma filter
//  */
// export function lb4ToPrismaFilter<MT extends object = AnyObject>(
//   lb4Filter: Filter<MT>,
// ): PrismaGenericTypes.Filter {
//   lb4Filter = cloneDeep(lb4Filter);
//   let prismaFilter: PrismaGenericTypes.Filter = {};

//   if (lb4Filter.fields && lb4Filter.include)
//     throw new Error(
//       '`fields` and `include` cannot be used simultaneously in Prisma filters.',
//     );

//   // Fields filter mapping
//   if (lb4Filter.fields) {
//     // Required to dictate that the Prisma filter without "include" is being
//     // created.
//     prismaFilter = {select: undefined};
//     prismaFilter.select = {};

//     if (Array.isArray(lb4Filter.fields)) {
//       for (const field in lb4Filter.fields) {
//         prismaFilter.select[field] = true;
//       }
//     } else {
//       for (const field in lb4Filter.fields) {
//         prismaFilter.select[field] = lb4Filter.fields[field]!;
//       }
//     }
//   }

//   // Inclusion filter mapping
//   if (lb4Filter.include) {
//     // Required to dictate that the Prisma filter without "select" is being
//     // created.
//     prismaFilter = {include: undefined};
//     prismaFilter.include = {};

//     for (const inclusion in lb4Filter.include) {
//       if (typeof inclusion === 'string') prismaFilter.include[inclusion] = true;
//       else prismaFilter.include[inclusion] = lb4ToPrismaFilter(inclusion);
//     }
//   }

//   // Skip/offset and limit filter mapping
//   prismaFilter.skip = lb4Filter.offset ?? lb4Filter.skip;
//   prismaFilter.take = lb4Filter.limit;

//   // Order filter mapping
//   if (lb4Filter.order) {
//     prismaFilter.orderBy = {};
//     for (const order in lb4Filter.order) {
//       const [prop, rawDirection] = order.split(' ');

//       const direction = rawDirection.toLowerCase() ?? 'asc';

//       if (!['asc', 'desc'].includes(direction))
//         throw new Error('Invalid direciton');

//       prismaFilter.orderBy[prop] = direction as 'asc' | 'desc';
//     }
//   }

//   if (lb4Filter.where) {
//     prismaFilter.where = lb4ToPrismaWhereFilter(lb4Filter.where);
//   }

//   return prismaFilter;
// }

// /**
//  * Converts a LoopBack 4 {@link @loopback/repository#Where} filter to its Prisma
//  * equivilant.
//  *
//  * @remarks
//  * ## Where Filter Mapping
//  *
//  * | LoopBack 4          | Prisma       |
//  * | ------------------- | ------------ |
//  * | literal, eq         | literal      |
//  * | neq                 | not(literal) |
//  * | gt                  | gt           |
//  * | gte                 | gte          |
//  * | lt                  | lt           |
//  * | lte                 | lte          |
//  * | between (exclusive) | lt + gt      |
//  * | inq                 | in           |
//  * | nin                 | not(in)      |
//  * | near                | N/A          |
//  * | like                | N/A          |
//  * | ilike               | N/A          |
//  * | regexp              | N/A          |
//  *
//  * @typeParam MT key-value map of properties that will be converted, typically
//  * a subclass of {@link @loopback/repository#Model}.
//  * @param lb4Filter Target LoopBack 4 where filter to convert.
//  * @returns Type-compatible Prisma where filter.
//  */
// function lb4ToPrismaWhereFilter<MT extends object = AnyObject>(
//   lb4Filter: Where<MT>,
// ): PrismaGenericTypes.WhereFilter {
//   const prismaFilter: PrismaGenericTypes.WhereFilter = {};
//   for (const prop in lb4Filter) {
//     if (prop === 'and' && Array.isArray(lb4Filter[prop])) {
//       prismaFilter['AND'] = [];
//       for (const andItem in lb4Filter[prop])
//         prismaFilter['AND'].push(
//           lb4ToPrismaWhereFilter(lb4Filter[prop][andItem]),
//         );
//     }
//   }

//   return prismaFilter;
// }
