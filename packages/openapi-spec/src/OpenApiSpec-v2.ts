// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/openapi-spec
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
 * OpenApiSpec - A typescript representation of OpenApi/Swagger Spec 2.0
 */

// NOTE(bajtos) Custom extensions can use arbitrary type as the value,
// e.g. a string, an object or an array
// tslint:disable-next-line:no-any
export type ExtensionValue = any;

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#swagger-object
export interface OpenApiSpec {
  basePath: string;
  paths: PathsObject;

  // TODO(bajtos) describe all properties

  // Allow users to use extensions
  [extension: string]: ExtensionValue;
}

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#swagger-object
export interface PathsObject {
  [httpPathOrSwaggerExtension: string]: PathItemObject | ExtensionValue;
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

  [extension: string]: ExtensionValue;
}

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#operationObject
export interface OperationObject {
  'x-operation-name': string;
  parameters?: Array<ParameterObject | ReferenceObject>;
  responses: ResponsesObject;

  // TODO(bajtos) describe all properties

  [extension: string]: ExtensionValue;
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

  [extension: string]: ExtensionValue;
}

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#parameterIn
export type ParameterLocation = 'query'| 'header'| 'path'| 'formData' | 'body';

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#referenceObject
export interface ReferenceObject {
  $ref: string;
}

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#responsesObject
export interface ResponsesObject {
  default?: ResponseObject | ReferenceObject;

  [httpStatusCodeOrSwaggerExtension: string]: ResponseObject | ReferenceObject | ExtensionValue;
}

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#responseObject
export interface ResponseObject {
  description: string;
  schema: SchemaObject;

  // TODO(bajtos) headers, examples

  [extension: string]: ExtensionValue;
}

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#schemaObject
export interface SchemaObject {
  // TODO(bajtos) describe all properties,
  // enforce polymorphic fields based on "type" value
  type: string;
  items: SchemaItem;

  [extension: string]: ExtensionValue;
}

export interface SchemaItem {
  // TODO(bajtos) describe all properties,
  // enforce polymorphic fields based on "type" value
  type: string;
  additionalProperties: boolean;

  [extension: string]: ExtensionValue;
}
