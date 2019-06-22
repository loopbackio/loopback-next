// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3-types
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
 * OpenApiSpec - A typescript representation of OpenApi 3.0.0
 */
import {OpenAPIObject} from 'openapi3-ts';

// Export spec interfaces from the community module if missing in our package
export * from 'openapi3-ts';

export type OpenApiSpec = OpenAPIObject;

/**
 * Create an empty OpenApiSpec object that's still a valid openapi document.
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
