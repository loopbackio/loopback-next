// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/openapi-spec
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
 * OpenApiSpec - A typescript representation of OpenApi/Swagger Spec 2.0
 */

// tslint:disable:max-line-length

/**
 * Custom extensions can use arbitrary type as the value,
 * e.g. a string, an object or an array.
 */
// tslint:disable-next-line:no-any
export type ExtensionValue = any;

/**
 * This is the root document object for the API specification.
 * <p>Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#swagger-object
 */
export interface OpenApiSpec {
  /**
   * The host (name or ip) serving the API.
   * This MUST be the host only and does not include the scheme nor sub-paths.
   * It MAY include a port. If the host is not included,
   * the host serving the documentation is to be used (including the port).
   * The host does not support
   * [path templating](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#pathTemplating).
   */
  host?: string;

  /**
   * The base path on which the API is served, which is relative to the host.
   * If it is not included, the API is served directly under the host.
   * The value MUST start with a leading slash (/).
   * The basePath does not support
   * [path templating](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#pathTemplating).
   */
  basePath: string;

  /**
   * The available paths and operations for the API.
   */
  paths: PathsObject;

  // TODO(bajtos) describe all properties

  // Allow users to use extensions
  [extension: string]: ExtensionValue;
}

/**
 * Holds the relative paths to the individual endpoints.
 * The path is appended to the basePath in order to construct the full URL.
 * The Paths may be empty, due to ACL constraints.
 * <p>Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#paths-object
 */
export interface PathsObject {
  [httpPathOrSwaggerExtension: string]: PathItemObject | ExtensionValue;
}

/**
 * Describes the operations available on a single path.
 * A Path Item may be empty, due to ACL constraints.
 * The path itself is still exposed to the documentation viewer
 * but they will not know which operations and parameters are available.
 * <p>Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#pathItemObject
 */
export interface PathItemObject {
  /**
   * A definition of a GET operation on this path.
   */
  get: OperationObject;

  /**
   * A definition of a PUT operation on this path.
   */
  put: OperationObject;

  /**
   * A definition of a POST operation on this path.
   */
  post: OperationObject;

  /**
   * A definition of a DELETE operation on this path.
   */
  delete: OperationObject;

  /**
   * A definition of a OPTIONS operation on this path.
   */
  options: OperationObject;

  /**
   * A definition of a HEAD operation on this path.
   */
  head: OperationObject;

  /**
   * A definition of a PATCH operation on this path.
   */
  patch: OperationObject;

  // TODO(bajtos) $ref, parameters

  [extension: string]: ExtensionValue;
}

/**
 * Describes a single API operation on a path.
 * <p>Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#operationObject
 */
export interface OperationObject {
  /**
   * IBM/LoopBack extension: The name of the controller method implementing
   * this operation.
   */
  'x-operation-name'?: string;

  /**
   * A list of parameters that are applicable for this operation.
   * If a parameter is already defined at the Path Item,
   * the new definition will override it, but can never remove it.
   * The list MUST NOT include duplicated parameters.
   * A unique parameter is defined by a combination of a name and location.
   * The list can use the Reference Object to link to parameters that are
   * defined at the Swagger Object's parameters.
   * There can be one "body" parameter at most.
   */
  parameters?: Array<ParameterObject | ReferenceObject>;

  /**
   * The list of possible responses as they are returned from executing
   * this operation.
   */
  responses: ResponsesObject;

  // TODO(bajtos) describe all properties

  [extension: string]: ExtensionValue;
}

/**
 * Describes a single operation parameter.
 * <p>Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#parameterObject
 */
export interface ParameterObject {
  /**
   * The name of the parameter. Parameter names are case sensitive.
   *  - If `in` is "path", the `name` field MUST correspond to the associated
   *    path segment from the `path` field in the Paths Object.
   *    See [Path Templating](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#pathTemplating)
   *    for further information.
   *  - For all other cases, the `name` corresponds to the parameter name used
   *    based on the `in` property.
   */
  name: string;

  /**
   * The location of the parameter.
   * Possible values are "query", "header", "path", "formData" or "body".
   */
  in: ParameterLocation;

  /**
   * A brief description of the parameter. This could contain examples of use.
   * [GFM syntax](https://guides.github.com/features/mastering-markdown/#GitHub-flavored-markdown)
   * can be used for rich text representation.
   */
  description?: string;

  /**
   * Determines whether this parameter is mandatory.
   * If the parameter is `in` "path", this property is required and
   * its value MUST be `true`. Otherwise, the property MAY be included
   * and its default value is `false`.
   */
  required?: boolean;

  // TODO(bajtos) describe all properties,
  // enforce polymorphic fields based on "in" value

  /**
   * _If `in` is any value other than "body":_
   * The type of the parameter. Since the parameter is not located at
   * the request body, it is limited to simple types (that is, not an object).
   * The value MUST be one of "string", "number", "integer", "boolean",
   * "array" or "file". If type is "file", the `consumes` MUST be either
   * "multipart/form-data", " application/x-www-form-urlencoded" or both
   * and the parameter MUST be `in` "formData".
   */
  type: string;

  [extension: string]: ExtensionValue;
}

/**
 * The location of a parameter.
 * Possible values are "query", "header", "path", "formData" or "body".
 * <p>Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#parameterIn
 */
export type ParameterLocation =
  | 'query'
  | 'header'
  | 'path'
  | 'formData'
  | 'body';

/**
 * A simple object to allow referencing other definitions in the specification.
 * It can be used to reference parameters and responses that are defined
 * at the top level for reuse.
 * The Reference Object is a [JSON Reference](http://tools.ietf.org/html/draft-pbryan-zyp-json-ref-02)
 * that uses a [JSON Pointer](https://tools.ietf.org/html/rfc6901) as its value.
 * For this specification, only canonical dereferencing is supported.
 * <p>Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#referenceObject
 * <p>**Example**
 * ```json
 * {
 *   "$ref": "#/definitions/Pet"
 * }
 * ```
 */
export interface ReferenceObject {
  /**
   * The reference string.
   */
  $ref: string;
}

/**
 * A container for the expected responses of an operation.
 * The container maps a HTTP response code to the expected response.
 * It is not expected from the documentation to necessarily cover all
 * possible HTTP response codes, since they may not be known in advance.
 * However, it is expected from the documentation to cover a successful
 * operation response and any known errors.
 * <p>The `default` can be used as the default response object for all
 * HTTP codes that are not covered individually by the specification.
 * <p>The `ResponsesObject` MUST contain at least one response code,
 * and it SHOULD be the response for a successful operation call.
 * <p>Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#responsesObject
 */
export interface ResponsesObject {
  /**
   * The documentation of responses other than the ones declared for specific
   * HTTP response codes. It can be used to cover undeclared responses.
   * Reference Object can be used to link to a response that is defined at
   * the Swagger Object's responses section.
   */
  default?: ResponseObject | ReferenceObject;

  [httpStatusCodeOrSwaggerExtension: string]:
    | ResponseObject
    | ReferenceObject
    | ExtensionValue;
}

/**
 * Describes a single response from an API Operation.
 * <p>Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#responseObject
 */
export interface ResponseObject {
  /**
   * A short description of the response.
   * [GFM syntax](https://guides.github.com/features/mastering-markdown/#GitHub-flavored-markdown)
   * can be used for rich text representation.
   */
  description: string;

  /**
   * A definition of the response structure.
   * It can be a primitive, an array or an object.
   * If this field does not exist, it means no content is returned
   * as part of the response. As an extension to the `SchemaObject`,
   * its root type value may also be "file".
   * This SHOULD be accompanied by a relevant `produces` mime-type.
   */
  schema: SchemaObject;

  // TODO(bajtos) headers, examples

  [extension: string]: ExtensionValue;
}

/**
 * The Schema Object allows the definition of input and output data types.
 * These types can be objects, but also primitives and arrays.
 * This object is based on the [JSON Schema Specification Draft 4](http://json-schema.org/)
 * and uses a predefined subset of it. On top of this subset, there are
 * extensions provided by this specification to allow for more complete documentation.
 * <p>Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#schemaObject
 */
export interface SchemaObject {
  // TODO(bajtos) describe all properties,
  // enforce polymorphic fields based on "type" value
  type: string;
  items?: SchemaItem;

  [extension: string]: ExtensionValue;
}

/**
 * Definition of an array item type as per
 * [JSON Schema Specification](http://json-schema.org/).
 */
export interface SchemaItem {
  // TODO(bajtos) describe all properties,
  // enforce polymorphic fields based on "type" value
  type: string;
  additionalProperties: boolean;

  [extension: string]: ExtensionValue;
}
