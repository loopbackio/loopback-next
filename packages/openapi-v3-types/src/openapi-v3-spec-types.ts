// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3-types
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
 * OpenApiSpec - A typescript representation of OpenApi 3.0.0
 */

// tslint:disable:max-line-length

import * as OAS3 from 'openapi3-ts';
// Export spec interfaces from the community module if missing in our package
export * from 'openapi3-ts';

export type OpenApiSpec = OAS3.OpenAPIObject;
/**
 * Custom extensions can use arbitrary type as the value,
 * e.g. a string, an object or an array.
 */
// tslint:disable-next-line:no-any
export type ExtensionValue = any;

/**
 * The location of a parameter.
 * Possible values are "query", "header", "path" or "cookie".
 * Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#parameter-locations
 */
export type ParameterLocation = 'query' | 'header' | 'path' | 'cookie';

/**
 * The style of a parameter.
 * Describes how the parameter value will be serialized.
 * (serialization is not implemented yet)
 * Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#style-values
 */
export type ParameterStyle =
  | 'matrix'
  | 'label'
  | 'form'
  | 'simple'
  | 'spaceDelimited'
  | 'pipeDelimited'
  | 'deepObject';

/**
 * The Schema Object allows the definition of input and output data types.
 * the properties consist of two parts:
 * - taken directly from the JSON Schema, is described by interface `JSONType`
 * - taken from the JSON Schema, but definitions were adjusted to the
 *   OpenAPI Specification, is described by interface `OAS3SchemaObject`
 */
export interface SchemaObject extends JSONType, OAS3SchemaObject {}

/**
 * Part of OpenAPI Schema Object, The following properties are taken from the
 * JSON Schema definition but their definitions were adjusted to the OpenAPI
 * Specification.
 */
export interface OAS3SchemaObject extends ISpecificationExtension {
  nullable?: boolean;
  discriminator?: DiscriminatorObject;
  readOnly?: boolean;
  writeOnly?: boolean;
  xml?: XMLObject;
  externalDocs?: ExternalDocumentationObject;
  example?: ExtensionValue;
  examples?: ExtensionValue[];
  deprecated?: boolean;

  type?: string;
  allOf?: (SchemaObject | ReferenceObject)[];
  oneOf?: (SchemaObject | ReferenceObject)[];
  anyOf?: (SchemaObject | ReferenceObject)[];
  not?: SchemaObject | ReferenceObject;
  items?: SchemaObject | ReferenceObject;
  properties?: {[propertyName: string]: SchemaObject | ReferenceObject};
  additionalProperties?: SchemaObject | ReferenceObject;
  description?: string;
  format?: string;
  default?: ExtensionValue;
}

/**
 * JSON type - This is part of the Schema object.
 * The following properties are taken directly from the JSON Schema
 * definition and follow the same specifications.
 * See https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#schema-object
 */

export type JSONType = {
  title?: string;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;
  maxLength?: number;
  minLength?: number;
  // (This string SHOULD be a valid regular expression, according to the ECMA 262 regular expression dialect)
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  enum?: Array<ExtensionValue>;
};

/**
 * Describes a single request body.
 * Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#request-body-object
 */
export interface RequestBodyObject extends ISpecificationExtension {
  description?: string;
  content: ContentObject;
  required?: boolean;
}

/**
 * Describes an object of multiple content types.
 * For example:
 * ```js
 * {
 *   'application/json': {
 *     schema: {...schemaObjectSpec}
 *   },
 *   'application/text': {
 *     schema: {...schemaObjectSpec}
 *   }
 * }
 * ```
 */
export interface ContentObject {
  [mediatype: string]: MediaTypeObject;
}

/**
 * Each Media Type Object provides schema and examples for the media type
 * identified by its key.
 * Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#media-type-object
 */
export interface MediaTypeObject extends ISpecificationExtension {
  schema?: SchemaObject | ReferenceObject;
  examples?: [ExampleObject | ReferenceObject];
  example?: ExampleObject | ReferenceObject;
  encoding?: EncodingObject;
}

/**
 * Describes an encoding object, used in ParameterObject
 */
export interface EncodingObject extends ISpecificationExtension {
  [property: string]: EncodingPropertyObject | ExtensionValue;
}

/**
 * Describes an encoding object, used in `SchemaObject`
 */
export interface EncodingPropertyObject {
  contentType?: string;
  headers?: {[key: string]: HeaderObject | ReferenceObject};
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  [key: string]: ExtensionValue;
}

/**
 * Describes a header object, used in `EncodingPropertyObject`
 */
export interface HeaderObject extends ParameterObject {}

/**
 * Describes a single operation parameter.
 * A unique parameter is defined by a combination of a name and location.
 * Specification
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#parameter-object
 */
export interface ParameterObject extends ISpecificationExtension {
  name: string;
  in: ParameterLocation;
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;

  style?: ParameterStyle;
  explode?: boolean;
  allowReserved?: boolean;
  schema?: SchemaObject | ReferenceObject;
  examples?: {[param: string]: ExampleObject | ReferenceObject};
  example?: ExtensionValue;
  content?: ContentObject;
}

/**
 * Describes an example object, used in `ParameterObject`
 */
export interface ExampleObject {
  summary?: string;
  description?: string;
  value?: ExtensionValue;
  externalValue?: string;
  [property: string]: ExtensionValue;
}

export interface ReferenceObject {
  $ref: string;
}

/**
 * Describes a discriminator object, used in `SchemaObject`
 */
export interface DiscriminatorObject {
  propertyName: string;
  mapping?: {[key: string]: string};
}

/**
 * Describes an XML object, used in `SchemaObject`
 */
export interface XMLObject extends ISpecificationExtension {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
}

/**
 * Describes an external document object, used in `SchemaObject`
 */
export interface ExternalDocumentationObject extends ISpecificationExtension {
  description?: string;
  url: string;
}

/**
 * Allow key(string) value extension specifications.
 * These value extensions cannot be used as constraints, but can be filtered for retrieval.
 */
export interface ISpecificationExtension {
  [extensionName: string]: ExtensionValue;
}

/**
 * Maps names to a given type of values
 */
export interface MapObject<T> {
  /**
   * Maps between a name and object
   */
  [name: string]: T;
}

/**
 * Schemas Object in components
 */
export interface SchemasObject extends MapObject<SchemaObject> {
  [name: string]: SchemaObject;
}

/**
 * Lists the available scopes for an OAuth2 security scheme.
 */
export interface ScopesObject
  extends MapObject<string>,
    ISpecificationExtension {
  /**
   * Maps between a name of a scope to a short description of it (as the value
   * of the property).
   */
  [name: string]: string;
}

/**
 * A declaration of the security schemes available to be used in the
 * specification. This does not enforce the security schemes on the operations
 * and only serves to provide the relevant details for each scheme.
 */
export interface SecurityDefinitionsObject
  extends MapObject<OAS3.SecuritySchemeObject> {
  /**
   * A single security scheme definition, mapping a "name" to the scheme it
   * defines.
   */
  [name: string]: OAS3.SecuritySchemeObject;
}

/**
 * An object to hold parameters to be reused across operations. Parameter
 * definitions can be referenced to the ones defined here.
 *
 * This does not define global operation parameters.
 */
export interface ParametersDefinitionsObject
  extends MapObject<OAS3.ParameterObject> {
  /**
   * A single parameter definition, mapping a "name" to the parameter it
   * defines.
   */
  [name: string]: OAS3.ParameterObject;
}

/**
 * An object to hold responses to be reused across operations. Response
 * definitions can be referenced to the ones defined here.
 *
 * This does not define global operation responses.
 */
export interface ResponsesDefinitionsObject
  extends MapObject<OAS3.ResponseObject> {
  /**
   * A single response definition, mapping a "name" to the response it defines.
   */
  [name: string]: OAS3.ResponseObject;
}

/**
 * A container for the expected responses of an operation.
 * The container maps a HTTP response code to the expected response.
 * It is not expected from the documentation to necessarily cover all
 * possible HTTP response codes, since they may not be known in advance.
 * However, it is expected from the documentation to cover a successful
 * operation response and any known errors.
 * The `default` can be used as the default response object for all
 * HTTP codes that are not covered individually by the specification.
 * The `ResponsesObject` MUST contain at least one response code,
 * and it SHOULD be the response for a successful operation call.
 * Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#responsesObject
 */
export interface ResponsesObject
  extends MapObject<OAS3.ResponseObject | OAS3.ReferenceObject | undefined>,
    ISpecificationExtension {
  /**
   * The documentation of responses other than the ones declared for specific
   * HTTP response codes. It can be used to cover undeclared responses.
   * Reference Object can be used to link to a response that is defined at
   * the Swagger Object's responses section.
   */
  default?: OAS3.ResponseObject | OAS3.ReferenceObject;
}

/**
 * Lists the headers that can be sent as part of a response.
 */
export interface HeadersObject extends MapObject<OAS3.HeaderObject> {
  /**
   * The name of the property corresponds to the name of the header. The value
   * describes the type of the header.
   */
  [name: string]: OAS3.HeaderObject;
}

/**
 * Holds the relative paths to the individual endpoints.
 * The path is appended to the basePath in order to construct the full URL.
 * The Paths may be empty, due to ACL constraints.
 * Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#paths-object
 */
export interface PathsObject
  extends MapObject<
      OAS3.PathItemObject | OAS3.ReferenceObject | ExtensionValue
    > {
  [httpPathOrSwaggerExtension: string]:
    | OAS3.PathItemObject
    | OAS3.ReferenceObject
    | ExtensionValue;
}

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
