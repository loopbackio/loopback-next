// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ReferenceObject,
  RequestBodyObject,
  SchemaObject,
} from '@loopback/openapi-v3';
import {RestServerConfig, RestServerResolvedConfig} from '../rest.server';

/**
 * Create an OpenAPI request body spec with the given content
 * @param schema - The schema object
 * @param options - Other attributes for the spec
 * @param mediaType - Optional media type, default to `application/json`
 */
export function aBodySpec(
  schema: SchemaObject | ReferenceObject,
  options: Partial<RequestBodyObject> = {},
  mediaType = 'application/json',
): RequestBodyObject {
  const spec = Object.assign({}, options);
  spec.content = spec.content || {};
  Object.assign(spec.content, {
    [mediaType]: {
      schema: schema,
    },
  });
  return spec as RequestBodyObject;
}

export function aRestServerConfig(
  customConfig?: RestServerConfig,
): RestServerResolvedConfig {
  return Object.assign(
    {
      port: 3000,
      openApiSpec: {disabled: true},
      apiExplorer: {disabled: true},
      cors: {},
      expressSettings: {},
      router: {},
    },
    customConfig,
  );
}
