import * as OAS3 from 'openapi3-ts';
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

export type ParameterType =
| 'string'
| 'number'
| 'integer'
| 'boolean'
| 'array'
| 'file';

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
export interface ScopesObject extends MapObject<string>, OAS3.ISpecificationExtension {
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
export interface ResponsesDefinitionsObject extends MapObject<OAS3.ResponseObject> {
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
 * <p>The `default` can be used as the default response object for all
 * HTTP codes that are not covered individually by the specification.
 * <p>The `ResponsesObject` MUST contain at least one response code,
 * and it SHOULD be the response for a successful operation call.
 * <p>Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#responsesObject
 */
export interface ResponsesObject
extends MapObject<OAS3.ResponseObject | OAS3.ReferenceObject | undefined>,
  OAS3.ISpecificationExtension {
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
 * <p>Specification:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#paths-object
 */
export interface PathsObject
extends MapObject<OAS3.PathItemObject | ExtensionValue> {
[httpPathOrSwaggerExtension: string]: OAS3.PathItemObject | ExtensionValue;
}

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

export interface RestServerOpt {
  port? :number
  hostname? :string
  basePath? :string
}

/**
 * Create an empty OpenApiSpec object that's still a valid openapi document.
 */
export function createEmptyApiSpec(restServerOptions: RestServerOpt): OpenApiSpec {
  return {
    openapi: '3.0.0',
    info: {
      title: 'LoopBack Application',
      version: '1.0.0',
    },
    paths: {},
    servers: [
      createDefaultServer(restServerOptions)
    ]
  };
}

export function createDefaultServer(restServerOptions: RestServerOpt): OAS3.ServerObject {
  return {
    "url": "{protocal}://{hostname}:{port}{basePath}",
    "description": "The default LoopBack rest server",
    "variables": {
        "protocal": {
            "default": "http"
        },
        "basePath": {
            "default": (restServerOptions && restServerOptions.basePath) || "/"
        },
        "port": {
            "default": (restServerOptions && restServerOptions.port) || 3000
        },
        "hostname": {
            "default": (restServerOptions && restServerOptions.hostname) || "localhost"
        }
    }
  }
}