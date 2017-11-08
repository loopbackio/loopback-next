// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as assert from 'assert';
import {Reflector} from '@loopback/context';
import {
  OperationObject,
  ParameterLocation,
  ParameterObject,
  SchemaObject,
  ParameterType,
  PathsObject,
} from '@loopback/openapi-spec';

const debug = require('debug')('loopback:core:router:metadata');

const ENDPOINTS_KEY = 'rest:endpoints';
const API_SPEC_KEY = 'rest:api-spec';

// tslint:disable:no-any

export interface ControllerSpec {
  /**
   * The base path on which the Controller API is served.
   * If it is not included, the API is served directly under the host.
   * The value MUST start with a leading slash (/).
   */
  basePath?: string;

  /**
   * The available paths and operations for the API.
   */
  paths: PathsObject;
}

/**
 * Decorate the given Controller constructor with metadata describing
 * the HTTP/REST API the Controller implements/provides.
 *
 * `@api` can be applied to controller classes. For example,
 * ```
 * @api({basePath: '/my'})
 * class MyController {
 *   // ...
 * }
 * ```
 *
 * @param spec OpenAPI specification describing the endpoints
 * handled by this controller
 *
 * @decorator
 */
export function api(spec: ControllerSpec) {
  return function(constructor: Function) {
    assert(
      typeof constructor === 'function',
      'The @api decorator can be applied to constructors only.',
    );
    const apiSpec = resolveControllerSpec(constructor, spec);
    Reflector.defineMetadata(API_SPEC_KEY, apiSpec, constructor);
  };
}

/**
 * Data structure for REST related metadata
 */
interface RestEndpoint {
  verb: string;
  path: string;
  spec?: OperationObject;
  target: any;
}

/**
 * Build the api spec from class and method level decorations
 * @param constructor Controller class
 * @param spec API spec
 */
function resolveControllerSpec(
  constructor: Function,
  spec?: ControllerSpec,
): ControllerSpec {
  debug(`Retrieving OpenAPI specification for controller ${constructor.name}`);

  if (spec) {
    debug('  using class-level spec defined via @api()', spec);
    spec = Object.assign({}, spec);
  } else {
    spec = {paths: {}};
  }

  const endpoints =
    Reflector.getMetadata(ENDPOINTS_KEY, constructor.prototype) || {};

  for (const op in endpoints) {
    const endpoint = endpoints[op];
    const className =
      endpoint.target.constructor.name ||
      constructor.name ||
      '<AnonymousClass>';
    const fullMethodName = `${className}.${op}`;

    const {verb, path} = endpoint;
    const endpointName = `${fullMethodName} (${verb} ${path})`;

    let operationSpec = endpoint.spec;
    if (!operationSpec) {
      // The operation was defined via @operation(verb, path) with no spec
      operationSpec = {
        responses: {},
      };
    }

    if (!spec.paths[path]) {
      spec.paths[path] = {};
    }

    if (spec.paths[path][verb]) {
      // Operations from subclasses override those from the base
      debug(`  Overriding ${endpointName} - endpoint was already defined`);
    }

    debug(`  adding ${endpointName}`, operationSpec);
    spec.paths[path][verb] = Object.assign({}, operationSpec, {
      'x-operation-name': op,
    });
  }
  return spec;
}

/**
 * Get the controller spec for the given class
 * @param constructor Controller class
 */
export function getControllerSpec(constructor: Function): ControllerSpec {
  let spec = Reflector.getMetadata(API_SPEC_KEY, constructor);
  if (!spec) {
    spec = resolveControllerSpec(constructor, spec);
    Reflector.defineMetadata(API_SPEC_KEY, spec, constructor);
  }
  return spec;
}

/**
 * Expose a Controller method as a REST API operation
 * mapped to `GET` request method.
 *
 * @param path The URL path of this operation, e.g. `/product/{id}`
 * @param spec The OpenAPI specification describing parameters and responses
 *   of this operation.
 */
export function get(path: string, spec?: OperationObject) {
  return operation('get', path, spec);
}

/**
 * Expose a Controller method as a REST API operation
 * mapped to `POST` request method.
 *
 * @param path The URL path of this operation, e.g. `/product/{id}`
 * @param spec The OpenAPI specification describing parameters and responses
 *   of this operation.
 */
export function post(path: string, spec?: OperationObject) {
  return operation('post', path, spec);
}

/**
 * Expose a Controller method as a REST API operation
 * mapped to `PUT` request method.
 *
 * @param path The URL path of this operation, e.g. `/product/{id}`
 * @param spec The OpenAPI specification describing parameters and responses
 *   of this operation.
 */
export function put(path: string, spec?: OperationObject) {
  return operation('put', path, spec);
}

/**
 * Expose a Controller method as a REST API operation
 * mapped to `PATCH` request method.
 *
 * @param path The URL path of this operation, e.g. `/product/{id}`
 * @param spec The OpenAPI specification describing parameters and responses
 *   of this operation.
 */
export function patch(path: string, spec?: OperationObject) {
  return operation('patch', path, spec);
}

/**
 * Expose a Controller method as a REST API operation
 * mapped to `DELETE` request method.
 *
 * @param path The URL path of this operation, e.g. `/product/{id}`
 * @param spec The OpenAPI specification describing parameters and responses
 *   of this operation.
 */
export function del(path: string, spec?: OperationObject) {
  return operation('delete', path, spec);
}

/**
 * Expose a Controller method as a REST API operation.
 *
 * @param verb HTTP verb, e.g. `GET` or `POST`.
 * @param path The URL path of this operation, e.g. `/product/{id}`
 * @param spec The OpenAPI specification describing parameters and responses
 *   of this operation.
 */
export function operation(verb: string, path: string, spec?: OperationObject) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    assert(
      typeof target[propertyKey] === 'function',
      '@operation decorator can be applied to methods only',
    );

    let endpoints = Object.assign(
      {},
      Reflector.getMetadata(ENDPOINTS_KEY, target),
    );
    Reflector.defineMetadata(ENDPOINTS_KEY, endpoints, target);

    let endpoint: Partial<RestEndpoint> = endpoints[propertyKey];
    if (!endpoint) {
      // Add the new endpoint metadata for the method
      endpoint = {verb, path, spec, target};
      endpoints[propertyKey] = endpoint;
    } else {
      // Update the endpoint metadata
      // It can be created by @param
      endpoint.verb = verb;
      endpoint.path = path;
      endpoint.target = target;
    }

    if (!spec) {
      // Users can define parameters and responses using decorators
      return;
    }

    // Decorator are invoked in reverse order of their definition.
    // For example, a method decorated with @operation() @param()
    // will invoke param() decorator first and operation() second.
    // As a result, we need to preserve any partial definitions
    // already provided by other decorators.
    editOperationSpec(endpoint, overrides => {
      const mergedSpec = Object.assign({}, spec, overrides);

      // Merge "responses" definitions
      mergedSpec.responses = Object.assign(
        {},
        spec.responses,
        overrides.responses,
      );

      return mergedSpec;
    });
  };
}

const paramDecoratorStyle = Symbol('ParamDecoratorStyle');

/**
 * Describe an input parameter of a Controller method.
 *
 * `@param` can be applied to method itself or specific parameters. For example,
 * ```
 * class MyController {
 *   @get('/')
 *   @param(offsetSpec)
 *   @param(pageSizeSpec)
 *   list(offset?: number, pageSize?: number) {}
 * }
 * ```
 * or
 * ```
 * class MyController {
 *   @get('/')
 *   list(
 *     @param(offsetSpec) offset?: number,
 *     @param(pageSizeSpec) pageSize?: number,
 *   ) {}
 * }
 * ```
 * Please note mixed usage of `@param` at method/parameter level is not allowed.
 *
 * @param paramSpec Parameter specification.
 */
export function param(paramSpec: ParameterObject) {
  return function(
    target: any,
    propertyKey: string,
    descriptorOrParameterIndex: PropertyDescriptor | number,
  ) {
    assert(
      typeof target[propertyKey] === 'function',
      '@param decorator can be applied to methods only',
    );

    let endpoints = Object.assign(
      {},
      Reflector.getMetadata(ENDPOINTS_KEY, target),
    );
    Reflector.defineMetadata(ENDPOINTS_KEY, endpoints, target);

    let endpoint: Partial<RestEndpoint> = endpoints[propertyKey];
    if (!endpoint) {
      // Add the new endpoint metadata for the method
      endpoint = {target};
      endpoints[propertyKey] = endpoint;
    }

    editOperationSpec(endpoint, operationSpec => {
      let decoratorStyle;
      if (typeof descriptorOrParameterIndex === 'number') {
        decoratorStyle = 'parameter';
      } else {
        decoratorStyle = 'method';
      }
      if (!operationSpec.parameters) {
        operationSpec.parameters = [];
        // Record the @param decorator style to ensure consistency
        operationSpec[paramDecoratorStyle] = decoratorStyle;
      } else {
        // Mixed usage of @param at method/parameter level is not allowed
        if (operationSpec[paramDecoratorStyle] !== decoratorStyle) {
          throw new Error(
            'Mixed usage of @param at method/parameter level' +
              ' is not allowed.',
          );
        }
      }

      if (typeof descriptorOrParameterIndex === 'number') {
        operationSpec.parameters[descriptorOrParameterIndex] = paramSpec;
      } else {
        operationSpec.parameters.unshift(paramSpec);
      }

      return operationSpec;
    });
  };
}

function editOperationSpec(
  endpoint: Partial<RestEndpoint>,
  updateFn: (spec: OperationObject) => OperationObject,
) {
  let spec = endpoint.spec;
  if (!spec) {
    spec = {
      responses: {},
    };
  }

  spec = updateFn(spec);
  endpoint.spec = spec;
}

export namespace param {
  export const query = {
    /**
     * Define a parameter of "string" type that's read from the query string.
     *
     * @param name Parameter name.
     */
    string: createParamShortcut('query', 'string'),

    /**
     * Define a parameter of "number" type that's read from the query string.
     *
     * @param name Parameter name.
     */
    number: createParamShortcut('query', 'number'),

    /**
     * Define a parameter of "integer" type that's read from the query string.
     *
     * @param name Parameter name.
     */
    integer: createParamShortcut('query', 'integer'),

    /**
     * Define a parameter of "boolean" type that's read from the query string.
     *
     * @param name Parameter name.
     */
    boolean: createParamShortcut('query', 'boolean'),
  };

  export const header = {
    /**
     * Define a parameter of "string" type that's read from a request header.
     *
     * @param name Parameter name, it must match the header name
     *   (e.g. `Content-Type`).
     */
    string: createParamShortcut('header', 'string'),

    /**
     * Define a parameter of "number" type that's read from a request header.
     *
     * @param name Parameter name, it must match the header name
     *   (e.g. `Content-Length`).
     */
    number: createParamShortcut('header', 'number'),

    /**
     * Define a parameter of "integer" type that's read from a request header.
     *
     * @param name Parameter name, it must match the header name
     *   (e.g. `Content-Length`).
     */
    integer: createParamShortcut('header', 'integer'),

    /**
     * Define a parameter of "boolean" type that's read from a request header.
     *
     * @param name Parameter name, it must match the header name,
     *   (e.g. `DNT` or `X-Do-Not-Track`).
     */
    boolean: createParamShortcut('header', 'boolean'),
  };

  export const path = {
    /**
     * Define a parameter of "string" type that's read from request path.
     *
     * @param name Parameter name matching one of the placeholders in the path
     *   string.
     */
    string: createParamShortcut('path', 'string'),

    /**
     * Define a parameter of "number" type that's read from request path.
     *
     * @param name Parameter name matching one of the placeholders in the path
     *   string.
     */
    number: createParamShortcut('path', 'number'),

    /**
     * Define a parameter of "integer" type that's read from request path.
     *
     * @param name Parameter name matching one of the placeholders in the path
     *   string.
     */
    integer: createParamShortcut('path', 'integer'),

    /**
     * Define a parameter of "boolean" type that's read from request path.
     *
     * @param name Parameter name matching one of the placeholders in the path
     *   string.
     */
    boolean: createParamShortcut('path', 'boolean'),
  };

  export const formData = {
    /**
     * Define a parameter of "string" type that's read
     * from a field in the request body.
     *
     * @param name Parameter name.
     */
    string: createParamShortcut('formData', 'string'),

    /**
     * Define a parameter of "number" type that's read
     * from a field in the request body.
     *
     * @param name Parameter name.
     */
    number: createParamShortcut('formData', 'number'),

    /**
     * Define a parameter of "integer" type that's read
     * from a field in the request body.
     *
     * @param name Parameter name.
     */
    integer: createParamShortcut('formData', 'integer'),

    /**
     * Define a parameter of "boolean" type that's read
     * from a field in the request body.
     *
     * @param name Parameter name.
     */
    boolean: createParamShortcut('formData', 'boolean'),
  };

  /**
   * Define a parameter that's set to the full request body.
   *
   * @param name Parameter name
   * @param schema The schema defining the type used for the body parameter.
   */
  export const body = function(name: string, schema: SchemaObject) {
    return param({name, in: 'body', schema});
  };
}

function createParamShortcut(source: ParameterLocation, type: ParameterType) {
  // TODO(bajtos) @param.IN.TYPE('foo', {required: true})
  return (name: string) => {
    return param({name, in: source, type});
  };
}
