// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as assert from 'assert';
import {Reflector} from '@loopback/context';
import {OpenApiSpec, OperationObject} from '@loopback/openapi-spec';

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
  console.log('    ADDING CONTROLLER METHOD %s', fullMethodName);

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

  const operationSpec = Reflector.getMetadata(
    'loopback:operation-spec',
    proto,
    methodName,
  );
  if (!operationSpec) {
    throw new Error(
      `Missing OpenAPI specification for controller method ${endpointName}`,
    );
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
export function get(path: string, spec: OperationObject) {
  return operation('get', path, spec);
}

/**
 * Expose a Controller method as a REST API operation.
 *
 * @param verb HTTP verb, e.g. `GET` or `POST`.
 * @param path The URL path of this operation, e.g. `/product/{id}`
 * @param spec The OpenAPI specification describing parameters and responses
 *   of this operation.
 */
export function operation(verb: string, path: string, spec: OperationObject) {
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

    /* TODO(bajtos)
    if (!spec) {
      // Users can define parameters and responses using decorators
      return;
    }
    */

    Reflector.defineMetadata(
      'loopback:operation-spec',
      spec,
      target,
      propertyKey,
    );
  };
}
