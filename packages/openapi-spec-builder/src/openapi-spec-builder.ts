// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {OpenApiSpec, OperationObject} from '@loopback/openapi-spec';

/**
 * Create a new instance of OpenApiSpecBuilder.
 *
 * @param basePath The base path on which the API is served.
 */
export function givenOpenApiSpec(basePath?: string) {
  return new OpenApiSpecBuilder(basePath);
}

/**
 * A builder for creating OpenApiSpec documents.
 */
export class OpenApiSpecBuilder {
  private _spec: OpenApiSpec;

  /**
   * @param basePath The base path on which the API is served.
   */
  constructor(basePath: string = '/') {
    this._spec = {
      basePath,
      paths: {},
    };
  }

  /**
   * Define a new OperationObject at the given path and verb (method).
   *
   * @param verb The HTTP verb.
   * @param path The path relative to basePath.
   * @param spec Additional specification of the operation.
   */
  withOperation(verb: string, path: string, spec: OperationObject): this {
    if (!this._spec.paths[path]) this._spec.paths[path] = {};
    this._spec.paths[path][verb] = spec;
    return this;
  }

  /**
   * Define a new operation that returns a string response.
   *
   * @param verb The HTTP verb.
   * @param path The path relative to basePath.
   * @param operationName The name of the controller method implementing
   * this operation (`x-operation-name` field).
   */
  withOperationReturningString(
    verb: string,
    path: string,
    operationName: string,
  ): this {
    return this.withOperation(verb, path, {
      'x-operation-name': operationName,
      responses: {
        '200': {type: 'string'},
      },
    });
  }

  /**
   * Build the OpenApiSpec object.
   */
  build(): OpenApiSpec {
    // TODO(bajtos): deep-clone
    return this._spec;
  }
}
