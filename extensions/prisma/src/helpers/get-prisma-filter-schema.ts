// import {Prisma} from '.prisma/client';
// import {JsonSchema} from '@loopback/repository';
// import {keys} from 'ts-transformer-keys';

// /**
//  *
//  * @typeParam MT Prisma model type; NOT the Prisma model object itself.
//  */
// export function getPrismaFilterJsonSchemaFor<MT extends object>(
//   model: MT,
// ): JsonSchema {
//   const props = keys<MT>();
//   const filter: JsonSchema = {
//     type: 'object',
//     properties: {},
//   };

//   for (const prop in props) {
//     const propSchema: JsonSchema = {};
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-ignore
//     const rawPropType = typeof model[prop];
//     let propType: JsonSchema['type'];
//     switch (rawPropType) {
//       case 'string':
//       case 'number':
//       case 'boolean':
//       case 'object':
//         propType = rawPropType;
//         break;
//       case 'bigint':
//         propType = 'number';
//         break;
//       default:
//         throw new Error(
//           `Unsupported property type ('${rawPropType}') in model`,
//         );
//     }

//     propSchema['type'] = propType;

//     if (propType === 'object') {
//       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//       // @ts-ignore
//       propSchema['properties'] = getPrismaFilterJsonSchemaFor(model[prop]);
//     }
//     Prisma.UserScalarFieldEnum.;
//     filter.properties![prop] = propSchema;
//   }

//   return filter;
// }
