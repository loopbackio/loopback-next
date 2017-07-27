// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as assert from 'assert';
import {Reflector} from '@loopback/context';
import {
  OpenApiSpec,
  OperationObject,
  ParameterLocation,
  ParameterObject,
  SchemaObject,
  ParameterTypeValue,
} from '@loopback/openapi-spec';

const debug = require('debug')('loopback:core:router:metadata');

// tslint:disable:no-any

/**
 * Decorate the given Controller constructor with metadata describing
 * the HTTP/REST API the Controller implements/provides.
 *
 * @param {OpenApiSpec} spec OpenAPI specification describing the endpoints
 * handled by this controller
 *
 * @decorator
 */
export function api(spec: OpenApiSpec) {
  return function(constructor: Function) {
    assert(
      typeof constructor === 'function',
      'The @api decorator can be applied to constructors only.',
    );
    Reflector.defineMetadata('loopback:api-spec', spec, constructor);
  };
}

interface RestEndpoint {
  verb: string;
  path: string;
}

export function getApiSpec(constructor: Function): OpenApiSpec {
  debug(`Retrieving OpenAPI specification for controller ${constructor.name}`);

  let spec: OpenApiSpec = Reflector.getMetadata(
    'loopback:api-spec',
    constructor,
  );

  if (spec) {
    debug('  using class-level spec defined via @api()', spec);
    return spec;
  }

  spec = {basePath: '/', paths: {}};
  for (
    let proto = constructor.prototype;
    proto && proto !== Object.prototype;
    proto = Object.getPrototypeOf(proto)
  ) {
    addPrototypeMethodsToSpec(spec, proto);
  }
  return spec;
}

function addPrototypeMethodsToSpec(spec: OpenApiSpec, proto: any) {
  const controllerMethods = Object.getOwnPropertyNames(proto).filter(
    key => key !== 'constructor' && typeof proto[key] === 'function',
  );
  for (const methodName of controllerMethods) {
    addControllerMethodToSpec(spec, proto, methodName);
  }
}

function addControllerMethodToSpec(
  spec: OpenApiSpec,
  proto: any,
  methodName: string,
) {
  const className = proto.constructor.name || '<UnknownClass>';
  const fullMethodName = `${className}.${methodName}`;

  const endpoint: RestEndpoint = Reflector.getMetadata(
    'loopback:operation-endpoint',
    proto,
    methodName,
  );

  if (!endpoint) {
    debug(`  skipping ${fullMethodName} - no endpoint is defined`);
    return;
  }

  const {verb, path} = endpoint;
  const endpointName = `${fullMethodName} (${verb} ${path})`;

  let operationSpec = Reflector.getMetadata(
    'loopback:operation-spec',
    proto,
    methodName,
  );
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
    debug(`  skipping ${endpointName} - endpoint was already defined`);
    return;
  }

  debug(`  adding ${endpointName}`, operationSpec);
  spec.paths[path][verb] = Object.assign({}, operationSpec, {
    'x-operation-name': methodName,
  });
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
  return operation('del', path, spec);
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
  // tslint:disable-next-line:no-any
  return function(
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const endpoint: RestEndpoint = {verb, path};
    Reflector.defineMetadata(
      'loopback:operation-endpoint',
      endpoint,
      target,
      propertyKey,
    );

    if (!spec) {
      // Users can define parameters and responses using decorators
      return;
    }

    // Decorator are invoked in reverse order of their definition.
    // For example, a method decorated with @operation() @param()
    // will invoke param() decorator first and operation() second.
    // As a result, we need to preserve any partial definitions
    // already provided by other decorators.
    editOperationSpec(target, propertyKey, overrides => {
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

/**
 * Describe an input parameter of a Controller method.
 *
 * @param paramSpec Parameter specification.
 */
export function param(paramSpec: ParameterObject) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    assert(
      typeof target[propertyKey] === 'function',
      '@param decorator can be applied to methods only',
    );

    editOperationSpec(target, propertyKey, operationSpec => {
      if (!operationSpec.parameters) {
        operationSpec.parameters = [];
      }

      operationSpec.parameters.unshift(paramSpec);

      return operationSpec;
    });
  };
}

function editOperationSpec(
  target: any,
  propertyKey: string,
  updateFn: (spec: OperationObject) => OperationObject,
) {
  let spec: OperationObject = Reflector.getMetadata(
    'loopback:operation-spec',
    target,
    propertyKey,
  );

  if (!spec) {
    spec = {
      responses: {},
    };
  }

  spec = updateFn(spec);

  Reflector.defineMetadata(
    'loopback:operation-spec',
    spec,
    target,
    propertyKey,
  );
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

function createParamShortcut(
  source: ParameterLocation,
  type: ParameterTypeValue,
) {
  // TODO(bajtos) @param.IN.TYPE('foo', {required: true})
  return (name: string) => {
    return param({name, in: source, type});
  };
}
