// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Model} from '@loopback/repository';
import {
  OpenAPIObject,
  ReferenceObject,
  ResponseObject,
  SchemaObject,
} from 'openapi3-ts';
/*
 * OpenApiSpec - A typescript representation of OpenApi 3.0.0
 */
export type OpenApiSpec = OpenAPIObject;

// Export also all spec interfaces
export * from 'openapi3-ts';

export const DEFAULT_OPENAPI_SPEC_INFO = {
  title: 'LoopBack Application',
  version: '1.0.0',
};

/**
 * Create an empty OpenApiSpec object that's still a valid openapi document.
 *
 * @deprecated Use `OpenApiBuilder` from `openapi3-ts` instead.
 */
export function createEmptyApiSpec(): OpenApiSpec {
  return {
    openapi: '3.0.0',
    info: {
      ...DEFAULT_OPENAPI_SPEC_INFO,
    },
    paths: {},
    servers: [{url: '/'}],
  };
}

export interface TagsDecoratorMetadata {
  tags: string[];
}

export enum OperationVisibility {
  DOCUMENTED = 'documented',
  UNDOCUMENTED = 'undocumented',
}

export type ResponseModelOrSpec =
  | typeof Model
  | SchemaObject
  | ResponseObject
  | ReferenceObject;

export interface ResponseDecoratorMetadataItem {
  responseCode: number;
  contentType: string;
  responseModelOrSpec: ResponseModelOrSpec;
  description: string;
}

export type ResponseDecoratorMetadata = ResponseDecoratorMetadataItem[];
