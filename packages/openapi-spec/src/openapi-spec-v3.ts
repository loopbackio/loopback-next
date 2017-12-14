export * from 'openapi3-ts';
import * as OAS3 from 'openapi3-ts';

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
 * Create an empty OpenApiSpec object that's still a valid Swagger document.
 */
export function createEmptyApiSpec(): OpenApiSpec {
  return {
    openapi: '3.0.0',
    basePath: '/',
    info: {
      title: 'LoopBack Application',
      version: '1.0.0',
    },
    paths: {},
  };
}