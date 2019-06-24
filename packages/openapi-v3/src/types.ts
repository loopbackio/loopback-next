// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {OpenAPIObject} from 'openapi3-ts';
/*
 * OpenApiSpec - A typescript representation of OpenApi 3.0.0
 */
export type OpenApiSpec = OpenAPIObject;

// Export also all spec interfaces
export * from 'openapi3-ts';

/**
 * Create an empty OpenApiSpec object that's still a valid openapi document.
 *
 * @deprecated Use `OpenApiBuilder` from `openapi3-ts` instead.
 */
export function createEmptyApiSpec(): OpenApiSpec {
  return {
    openapi: '3.0.0',
    info: {
      title: 'LoopBack Application',
      version: '1.0.0',
    },
    paths: {},
    servers: [{url: '/'}],
  };
}
