// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as SwaggerParser from 'swagger-parser';
import {OpenApiSpec} from '@loopback/openapi-spec-types';

// export async function validateApiSpec(spec: OpenApiSpec): Promise<void> {
//   const opts: SwaggerParser.Options = {
//     $refs: {
//       internal: false,
//       external: false,
//     },
//   } as SwaggerParser.Options;

//   // workaround for unhelpful message returned by SwaggerParser
//   // TODO(bajtos) contribute these improvements to swagger-parser
//   if (!spec.swagger) {
//     throw new Error('Missing required property: swagger at #/');
//   }

//   if (!spec.info) {
//     throw new Error('Missing required property: info at #/');
//   }

//   if (!spec.paths) {
//     throw new Error('Missing required property: paths at #/');
//   }

//   await SwaggerParser.validate(spec, opts);
// }

export async function validateApiSpec(spec: OpenApiSpec): Promise<void> {
  if (!spec.openapi) {
    throw new Error('Missing required property: swagger at #/');
  }

  if (!spec.info) {
    throw new Error('Missing required property: info at #/');
  }

  if (!spec.paths) {
    throw new Error('Missing required property: paths at #/');
  }
  return Promise.resolve();
}
