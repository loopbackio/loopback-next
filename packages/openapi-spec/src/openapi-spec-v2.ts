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
 * While the Swagger Specification tries to accommodate most use cases,
 * additional data can be added to extend the specification at certain points.
 *
 * The extensions properties are always prefixed by "x-" and can have any valid
 * JSON format value.
 *
 * The extensions may or may not be supported by the available tooling, but
 * those may be extended as well to add requested support (if tools are internal
 * or open-sourced).
 */
export interface Extensible {
  [extension: string]: ExtensionValue;
}

/**
 * This is the root document object for the API specification.
 * <p>Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#swagger-object
 */
export interface OpenApiSpec extends Extensible {
  /**
   * Specifies the Swagger Specification version being used.
   * It can be used by the Swagger UI and other clients to interpret
   * the API listing. The value MUST be "2.0".
   */
  swagger: '2.0';

  /**
   * Provides metadata about the API.
   * The metadata can be used by the clients if needed.
   */
  info: InfoObject;

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
   * The transfer protocol of the API. Values MUST be from the list: "http",
   * "https", "ws", "wss". If the schemes is not included, the default scheme
   * to be used is the one used to access the Swagger definition itself.
   */
  schemes?: Array<string>;

  /**
   * A list of MIME types the APIs can consume. This is global to all APIs but
   * can be overridden on specific API calls. Value MUST be as described under
   * Mime Types.
   */
  consumes?: Array<string>;

  /**
   * A list of MIME types the APIs can produce. This is global to all APIs but
   * can be overridden on specific API calls. Value MUST be as described under
   * Mime Types.
   */
  produces?: Array<string>;

  /**
   * The available paths and operations for the API.
   */
  paths: PathsObject;

  /**
   * An object to hold parameters that can be used across operations. This
   * property does not define global parameters for all operations.
   */
  parameters?: ParametersDefinitionsObject;

  /**
   * An object to hold responses that can be used across operations. This
   * property does not define global responses for all operations.
   */
  responses?: ResponsesDefinitionsObject;

  /**
   * An object to hold data types produced and consumed by operations.
   */
  definitions?: DefinitionsObject;

  /**
   * Security scheme definitions that can be used across the specification.
   */
  securityDefinitions?: SecurityDefinitionsObject;

  /**
   * A declaration of which security schemes are applied for the API as a whole.
   * The list of values describes alternative security schemes that can be used
   * (that is, there is a logical OR between the security requirements).
   * Individual operations can override this definition.
   */
  security?: Array<SecurityRequirementObject>;

  /**
   * A list of tags used by the specification with additional metadata. The
   * order of the tags can be used to reflect on their order by the parsing
   * tools. Not all tags that are used by the Operation Object must be declared.
   * The tags that are not declared may be organized randomly or based on the
   * tools' logic. Each tag name in the list MUST be unique.
   */
  tags?: Array<TagObject>;

  /**
   * Additional external documentation.
   */
  externalDocs?: ExternalDocumentationObject;
}

/**
 * The object provides metadata about the API.
 * The metadata can be used by the clients if needed,
 * and can be presented in the Swagger-UI for convenience.
 * <p>Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#infoObject
 */
export interface InfoObject extends Extensible {
  /**
   * The title of the application.
   */
  title: string;

  /**
   * A short description of the application.
   * [GFM syntax](https://guides.github.com/features/mastering-markdown/#GitHub-flavored-markdown)
   * can be used for rich text representation.
   */
  description?: string;

  /**
   * The Terms of Service for the API.
   */
  termsOfService?: string;

  /**
   * The contact information for the exposed API.
   */
  contact?: ContactObject;

  /**
   * The license information for the exposed API.
   */
  license?: LicenseObject;

  /**
   * Provides the version of the application API
   * (not to be confused with the specification version).
   */
  version: string;
}

/**
 * Contact information for the exposed API.
 */
export interface ContactObject extends Extensible {
  /**
   * The identifying name of the contact person/organization.
   */
  name?: string;

  /**
   *The URL pointing to the contact information. MUST be in the format of a URL.
   */
  url?: string;

  /**
   * The email address of the contact person/organization. MUST be in the format
   * of an email address.
   */
  email?: string;
}

/**
 * License information for the exposed API.
 */
export interface LicenseObject extends Extensible {
  /**
   * The license name used for the API.
   */
  name: string;

  /**
   * A URL to the license used for the API. MUST be in the format of a URL.
   */
  url?: string;
}

/**
 * Allows referencing an external resource for extended documentation.
 */
export interface ExternalDocumentationObject extends Extensible {
  /**
   * A short description of the target documentation. GFM syntax can be used for
   * rich text representation.
   */
  description?: string;

  /**
   * The URL for the target documentation. Value MUST be in the format of a URL.
   */
  url: string;
}

/**
 * Allows adding meta data to a single tag that is used by the Operation Object.
 * It is not mandatory to have a Tag Object per tag used there.
 */
export interface TagObject extends Extensible {
  /**
   * The name of the tag.
   */
  name: string;

  /**
   * A short description for the tag. GFM syntax can be used for rich text
   * representation.
   */
  description?: string;

  /**
   * Additional external documentation for this tag.
   */
  externalDocs?: ExternalDocumentationObject;
}

/**
 * Allows the definition of a security scheme that can be used by the
 * operations. Supported schemes are basic authentication, an API key (either
 * as a header or as a query parameter) and OAuth2's common flows (implicit,
 * password, application and access code).
 */
export interface SecuritySchemeObject extends Extensible {
  /**
   * The type of the security scheme. Valid values are "basic", "apiKey" or
   * "oauth2".
   */
  type: 'basic' | 'apiKey' | 'oauth2';

  /**
   * A short description for security scheme.
   */
  description?: string;

  /**
   * The name of the header or query parameter to be used.
   */
  name?: string;

  /**
   * The location of the API key. Valid values are "query" or "header".
   */
  in?: 'query' | 'header';

  /**
   * The flow used by the OAuth2 security scheme. Valid values are "implicit",
   * "password", "application" or "accessCode".
   */
  flow?: 'implicit' | 'password' | 'application' | 'accessCode';

  /**
   * ("implicit", "accessCode")	Required. The authorization URL to be used for
   * this flow. This SHOULD be in the form of a URL.
   */
  authorizationUrl?: string;

  /**
   * ("password", "application", "accessCode") Required. The token URL to be
   * used for this flow. This SHOULD be in the form of a URL.
   */
  tokenUrl?: string;

  /**
   * The available scopes for the OAuth2 security scheme.
   */
  scopes?: ScopesObject;
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
 * Lists the available scopes for an OAuth2 security scheme.
 */
export interface ScopesObject extends MapObject<string>, Extensible {
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
  extends MapObject<SecuritySchemeObject> {
  /**
   * A single security scheme definition, mapping a "name" to the scheme it
   * defines.
   */
  [name: string]: SecuritySchemeObject;
}

/**
 * Lists the required security schemes to execute this operation. The object can
 * have multiple security schemes declared in it which are all required (that
 * is, there is a logical AND between the schemes).
 * The name used for each property MUST correspond to a security scheme declared
 * in the Security Definitions.
 */
export interface SecurityRequirementObject extends MapObject<Array<string>> {
  /**
   * Each name must correspond to a security scheme which is declared in the
   * Security Definitions. If the security scheme is of type "oauth2", then the
   * value is a list of scope names required for the execution. For other
   * security scheme types, the array MUST be empty.
   */
  [name: string]: Array<string>;
}

/**
 * An object to hold data types that can be consumed and produced by operations.
 * These data types can be primitives, arrays or models.
 */
export interface DefinitionsObject extends MapObject<SchemaObject> {
  /**
   * A single definition, mapping a "name" to the schema it defines.
   */
  [name: string]: SchemaObject;
}

/**
 * An object to hold parameters to be reused across operations. Parameter
 * definitions can be referenced to the ones defined here.
 *
 * This does not define global operation parameters.
 */
export interface ParametersDefinitionsObject
  extends MapObject<ParameterObject> {
  /**
   * A single parameter definition, mapping a "name" to the parameter it
   * defines.
   */
  [name: string]: ParameterObject;
}

/**
 * An object to hold responses to be reused across operations. Response
 * definitions can be referenced to the ones defined here.
 *
 * This does not define global operation responses.
 */
export interface ResponsesDefinitionsObject extends MapObject<ResponseObject> {
  /**
   * A single response definition, mapping a "name" to the response it defines.
   */
  [name: string]: ResponseObject;
}

/**
 * Holds the relative paths to the individual endpoints.
 * The path is appended to the basePath in order to construct the full URL.
 * The Paths may be empty, due to ACL constraints.
 * <p>Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#paths-object
 */
export interface PathsObject
  extends MapObject<PathItemObject | ExtensionValue> {
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
export interface PathItemObject extends Extensible {
  /**
   * Allows for an external definition of this path item. The referenced
   * structure MUST be in the format of a Path Item Object. If there are
   * conflicts between the referenced definition and this Path Item's
   * definition, the behavior is undefined.
   */
  $ref?: string;

  /**
   * A definition of a GET operation on this path.
   */
  get?: OperationObject;

  /**
   * A definition of a PUT operation on this path.
   */
  put?: OperationObject;

  /**
   * A definition of a POST operation on this path.
   */
  post?: OperationObject;

  /**
   * A definition of a DELETE operation on this path.
   */
  delete?: OperationObject;

  /**
   * A definition of a OPTIONS operation on this path.
   */
  options?: OperationObject;

  /**
   * A definition of a HEAD operation on this path.
   */
  head?: OperationObject;

  /**
   * A definition of a PATCH operation on this path.
   */
  patch?: OperationObject;

  /**
   * A list of parameters that are applicable for all the operations described
   * under this path. These parameters can be overridden at the operation level,
   * but cannot be removed there. The list MUST NOT include duplicated
   * parameters. A unique parameter is defined by a combination of a name and
   * location. The list can use the Reference Object to link to parameters that
   * are defined at the Swagger Object's parameters. There can be one "body"
   * parameter at most.
   */
  parameters?: Array<ParameterObject | ReferenceObject>;
}

/**
 * Describes a single API operation on a path.
 * <p>Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#operationObject
 */
export interface OperationObject extends Extensible {
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

  /**
   * A list of tags for API documentation control. Tags can be used for logical
   * grouping of operations by resources or any other qualifier.
   */
  tags?: Array<string>;

  /**
   * A short summary of what the operation does. For maximum readability in the
   * swagger-ui, this field SHOULD be less than 120 characters.
   */
  summary?: string;

  /**
   * A verbose explanation of the operation behavior. GFM syntax can be used for
   * rich text representation.
   */
  description?: string;

  /**
   * Additional external documentation for this operation.
   */
  externalDocs?: ExternalDocumentationObject;

  /**
   * Unique string used to identify the operation. The id MUST be unique among
   * all operations described in the API. Tools and libraries MAY use the
   * operationId to uniquely identify an operation, therefore, it is recommended
   * to follow common programming naming conventions.
   */
  operationId?: string;

  /**
   * A list of MIME types the operation can consume. This overrides the consumes
   * definition at the Swagger Object. An empty value MAY be used to clear the
   * global definition. Value MUST be as described under Mime Types.
   */
  consumes?: Array<string>;

  /**
   * A list of MIME types the operation can produce. This overrides the produces
   * definition at the Swagger Object. An empty value MAY be used to clear the
   * global definition. Value MUST be as described under Mime Types.
   */
  produces?: Array<string>;

  /**
   * The transfer protocol of the API. Values MUST be from the list: "http",
   * "https", "ws", "wss". If the schemes is not included, the default scheme
   * to be used is the one used to access the Swagger definition itself.
   */
  schemes?: Array<string>;

  /**
   * Declares this operation to be deprecated. Usage of the declared operation
   * should be refrained. Default value is false.
   */
  deprecated?: boolean;

  /**
   * A declaration of which security schemes are applied for this operation.
   * The list of values describes alternative security schemes that can be used
   * (that is, there is a logical OR between the security requirements). This
   * definition overrides any declared top-level security. To remove a top-level
   * security declaration, an empty array can be used.
   */
  security?: SecurityRequirementObject;
}

export type ParameterType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'array'
  | 'file';

/**
 * Simple type - primitive types or array of such types. It is used by parameter
 * definitions that are not located in "body".
 */
export interface SimpleType {
  /**
   * The type of the parameter. Since the parameter is not located at
   * the request body, it is limited to simple types (that is, not an object).
   * The value MUST be one of "string", "number", "integer", "boolean",
   * "array" or "file". If type is "file", the `consumes` MUST be either
   * "multipart/form-data", " application/x-www-form-urlencoded" or both
   * and the parameter MUST be `in` "formData".
   */
  type?: ParameterType;

  /**
   * The extending format for the previously mentioned type. See
   * [Data Type Formats](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#dataTypeFormat)
   * for further details.
   */
  format?: string;

  /**
   * Sets the ability to pass empty-valued parameters. This is valid only for
   * either query or formData parameters and allows you to send a parameter
   * with a name only or an empty value. Default value is false.
   */
  allowEmptyValue?: boolean;

  /**
   * Required if type is "array". Describes the type of items in the array.
   */
  items?: ItemsObject;

  /**
   * Determines the format of the array if type array is used. Possible values
   * are:
   *   - csv: comma separated values foo,bar.
   *   - ssv: space separated values foo bar.
   *   - tsv: tab separated values foo\tbar.
   *   - pipes: pipe separated values foo|bar.
   *   - multi: corresponds to multiple parameter instances instead of multiple
   *     values for a single instance foo=bar&foo=baz. This is valid only for
   *     parameters in "query" or "formData".
   *
   * Default value is csv.
   */
  collectionFormat?: string;

  /**
   * Declares the value of the parameter that the server will use if none is
   * provided, for example a "count" to control the number of results per page
   * might default to 100 if not supplied by the client in the request. (Note:
   * "default" has no meaning for required parameters.) See
   * https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-6.2.
   * Unlike JSON Schema this value MUST conform to the defined type for this
   * parameter.
   */
  default?: ExtensionValue;

  /**
   * See https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-5.1.2.
   */
  maximum?: number;

  /**
   * See https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-5.1.2.
   */
  exclusiveMaximum?: number;

  /**
   * See https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-5.1.3.
   */
  minimum?: number;

  /**
   * See https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-5.1.3.
   */
  exclusiveMinimum?: number;

  /**
   * See https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-5.2.1.
   */
  maxLength?: number;

  /**
   * See https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-5.2.2.
   */
  minLength?: number;

  /**
   * See https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-5.2.3.
   */
  pattern?: string;

  /**
   * See https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-5.3.2.
   */
  maxItems?: number;

  /**
   * See https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-5.3.3.
   */
  minItems?: number;

  /**
   * See https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-5.3.4.
   */
  uniqueItems?: boolean;

  /**
   * See https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-5.5.1.
   */
  enum?: Array<ExtensionValue>;

  /**
   * See https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-5.1.1.
   */
  multipleOf?: number;
}

/**
 * The internal type of the array. The value MUST be one of "string",
 * "number", "integer", "boolean", or "array". Files and models are not
 * allowed.
 */
export type ItemType = 'string' | 'number' | 'integer' | 'boolean' | 'array';

/**
 * A limited subset of JSON-Schema's items object. It is used by parameter
 * definitions that are not located in "body". Please note it only differs
 * from SimpleType with parameter types excluding `file`.
 */
export interface ItemsObject extends SimpleType {
  type: ItemType;
}

/**
 * Describes a single operation parameter.
 * <p>Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#parameterObject
 */
export interface ParameterObject extends SimpleType, Extensible {
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

  /**
   * _If `in` is any value other than "body":_, the valid properties are
   * inherited from `SimpleType`.
   */

  /**
   * _If in is "body":_
   * The schema defining the type used for the body parameter.
   */
  schema?: SchemaObject;
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
export interface ResponsesObject
  extends MapObject<ResponseObject | ReferenceObject | undefined>,
    Extensible {
  /**
   * The documentation of responses other than the ones declared for specific
   * HTTP response codes. It can be used to cover undeclared responses.
   * Reference Object can be used to link to a response that is defined at
   * the Swagger Object's responses section.
   */
  default?: ResponseObject | ReferenceObject;
}

/**
 * Describes a single response from an API Operation.
 * <p>Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#responseObject
 */
export interface ResponseObject extends Extensible {
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

  /**
   * A list of headers that are sent with the response.
   */
  headers?: HeadersObject;

  /**
   * An example of the response message.
   */
  examples?: ExampleObject;
}

/**
 * Allows sharing examples for operation responses.
 */
export interface ExampleObject extends MapObject<ExtensionValue> {
  /**
   * The name of the property MUST be one of the Operation produces values
   * (either implicit or inherited). The value SHOULD be an example of what
   * such a response would look like.
   */
  [mimeType: string]: ExtensionValue;
}

/**
 * Lists the headers that can be sent as part of a response.
 */
export interface HeadersObject extends MapObject<HeaderObject> {
  /**
   * The name of the property corresponds to the name of the header. The value
   * describes the type of the header.
   */
  [name: string]: HeaderObject;
}

export interface HeaderObject extends ItemsObject, Extensible {
  /**
   * A short description of the header.
   */
  description: string;
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
export interface SchemaObject extends Extensible {
  /**
   * The following properties are taken directly from the JSON Schema
   * definition and follow the same specifications:
   */
  $ref?: string;
  format?: string;
  title?: string;
  description?: string;
  default?: ExtensionValue;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: Array<string>;
  enum?: Array<ExtensionValue>;
  type?: string;

  /**
   * The following properties are taken from the JSON Schema definition but
   * their definitions were adjusted to the Swagger Specification. Their
   * definition is the same as the one from JSON Schema, only where the original
   * definition references the JSON Schema definition, the Schema Object
   * definition is used instead.
   */
  allOf?: Array<SchemaObject>;
  properties?: MapObject<SchemaObject>;
  additionalProperties?: SchemaObject;
  items?: SchemaObject;

  /**
   * Other than the JSON Schema subset fields, the following fields may be used
   * for further schema documentation.
   */

  /**
   * Adds support for polymorphism. The discriminator is the schema property
   * name that is used to differentiate between other schema that inherit this
   * schema. The property name used MUST be defined at this schema and it MUST
   * be in the required property list. When used, the value MUST be the name of
   * this schema or any schema that inherits it.
   */
  discriminator?: string;

  /**
   * Relevant only for Schema "properties" definitions. Declares the property
   * as "read only". This means that it MAY be sent as part of a response but
   * MUST NOT be sent as part of the request. Properties marked as readOnly
   * being true SHOULD NOT be in the required list of the defined schema.
   * Default value is false.
   */
  readOnly?: boolean;

  /**
   * This MAY be used only on properties schemas. It has no effect on root
   * schemas. Adds Additional metadata to describe the XML representation format
   * of this property.
   */
  xml?: XMLObject;

  /**
   * Additional external documentation for this schema.
   */
  externalDocs?: ExternalDocumentationObject;

  /**
   * A free-form property to include an example of an instance for this schema.
   */
  example?: ExtensionValue;
}

/**
 * A metadata object that allows for more fine-tuned XML model definitions.
 *
 * When using arrays, XML element names are not inferred (for singular/plural
 * forms) and the name property should be used to add that information. See
 * examples for expected behavior.
 */
export interface XMLObject extends Extensible {
  /**
   * Replaces the name of the element/attribute used for the described schema
   * property. When defined within the Items Object (items), it will affect the
   * name of the individual XML elements within the list. When defined alongside
   * type being array (outside the items), it will affect the wrapping element
   * and only if wrapped is true. If wrapped is false, it will be ignored.
   */
  name?: string;

  /**
   * The URL of the namespace definition. Value SHOULD be in the form of a URL.
   */
  namespace?: string;

  /**
   * The prefix to be used for the name.
   */
  prefix?: string;

  /**
   * Declares whether the property definition translates to an attribute
   * instead of an element. Default value is false.
   */
  attribute?: boolean;

  /**
   * MAY be used only for an array definition. Signifies whether the array is
   * wrapped (for example, <books><book/><book/></books>) or unwrapped
   * (<book/><book/>). Default value is false. The definition takes effect
   * only when defined alongside type being array (outside the items).
   */
  wrapped?: boolean;
}

/**
 * Create an empty OpenApiSpec object that's still a valid Swagger document.
 */
export function createEmptyApiSpec(): OpenApiSpec {
  return {
    swagger: '2.0',
    basePath: '/',
    info: {
      title: 'LoopBack Application',
      version: '1.0.0',
    },
    paths: {},
  };
}
