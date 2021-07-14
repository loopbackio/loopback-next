// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MethodDecoratorFactory} from '@loopback/core';
import {RestEndpoint} from '../controller-spec';
import {OAI3Keys} from '../keys';
import {OperationObject} from '../types';

/**
 * Expose a Controller method as a REST API operation
 * mapped to `GET` request method.
 *
 * @param path - The URL path of this operation, e.g. `/product/{id}`
 * @param spec - The OpenAPI specification describing parameters and responses
 *   of this operation.
 */
export function get(path: string, spec?: OperationObject) {
  return operation('get', path, spec);
}

/**
 * Expose a Controller method as a REST API operation
 * mapped to `POST` request method.
 *
 * @param path - The URL path of this operation, e.g. `/product/{id}`
 * @param spec - The OpenAPI specification describing parameters and responses
 *   of this operation.
 */
export function post(path: string, spec?: OperationObject) {
  return operation('post', path, spec);
}

/**
 * Expose a Controller method as a REST API operation
 * mapped to `PUT` request method.
 *
 * @param path - The URL path of this operation, e.g. `/product/{id}`
 * @param spec - The OpenAPI specification describing parameters and responses
 *   of this operation.
 */
export function put(path: string, spec?: OperationObject) {
  return operation('put', path, spec);
}

/**
 * Expose a Controller method as a REST API operation
 * mapped to `PATCH` request method.
 *
 * @param path - The URL path of this operation, e.g. `/product/{id}`
 * @param spec - The OpenAPI specification describing parameters and responses
 *   of this operation.
 */
export function patch(path: string, spec?: OperationObject) {
  return operation('patch', path, spec);
}

/**
 * Expose a Controller method as a REST API operation
 * mapped to `DELETE` request method.
 *
 * @param path - The URL path of this operation, e.g. `/product/{id}`
 * @param spec - The OpenAPI specification describing parameters and responses
 *   of this operation.
 */
export function del(path: string, spec?: OperationObject) {
  return operation('delete', path, spec);
}

/**
 * Expose a Controller method as a REST API operation.
 *
 * @param verb - HTTP verb, e.g. `GET` or `POST`.
 * @param path - The URL path of this operation, e.g. `/product/{id}`
 * @param spec - The OpenAPI specification describing parameters and responses
 *   of this operation.
 */
export function operation(verb: string, path: string, spec?: OperationObject) {
  return MethodDecoratorFactory.createDecorator<Partial<RestEndpoint>>(
    OAI3Keys.METHODS_KEY,
    {
      verb,
      path,
      spec,
    },
    {decoratorName: '@operation'},
  );
}
