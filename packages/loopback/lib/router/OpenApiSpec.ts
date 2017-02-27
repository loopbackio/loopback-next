// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
 * OpenApiSpec - A typescript representation of OpenApi/Swagger Spec 2.0
 *
 * TODO(bajtos) I think this code should be released as a standalone npm package,
 * possibly contributed either to definitely-typed or to OpenAPI project.
 */

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#swagger-object
export interface OpenApiSpec {
  basePath: string;
  paths: PathsObject;

  // TODO(bajtos) describe all properties

  // Allow users to use extensions
  [extension: string]: any;
}

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#swagger-object
export interface PathsObject {
  [httpPathOrSwaggerExtension: string]: PathItemObject | any;
}

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#pathItemObject
export interface PathItemObject {
  get: OperationObject;
  put: OperationObject;
  post: OperationObject;
  delete: OperationObject;
  options: OperationObject;
  head: OperationObject;
  patch: OperationObject;

  // TODO(bajtos) $ref, parameters

  [extension: string]: any;
}

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#operationObject
export interface OperationObject {
  'x-operation-name': string;
  parameters?: Array<ParameterObject | ReferenceObject>;
  responses: ResponsesObject;

  // TODO(bajtos) describe all properties

  [extension: string]: any;
}

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#parameterObject
export interface ParameterObject {
  name: string;
  in: ParameterLocation;
  description?: string;
  required?: boolean;

  // TODO(bajtos) describe all properties,
  // enforce polymorphic fields based on "in" value
  type: string;

  [extension: string]: any;
}

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#parameterIn
type ParameterLocation = 'query'| 'header'| 'path'| 'formData' | 'body';

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#referenceObject
export interface ReferenceObject {
  $ref: string;
}

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#responsesObject
export interface ResponsesObject {
  default?: ResponseObject | ReferenceObject;

  [httpStatusCodeOrSwaggerExtension: string]: ResponseObject | ReferenceObject | any;
}

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#responseObject
export interface ResponseObject {
  description: string;
  schema: SchemaObject;

  // TODO(bajtos) headers, examples

  [extension: string]: any;
}

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#schemaObject
export interface SchemaObject {
  // TODO(bajtos) describe all properties,
  // enforce polymorphic fields based on "type" value
  type: string;
  items: SchemaItem;

  [extension: string]: any;
}

export interface SchemaItem {
  // TODO(bajtos) describe all properties,
  // enforce polymorphic fields based on "type" value
  type: string;
  additionalProperties: boolean;

  [extension: string]: any;
}
