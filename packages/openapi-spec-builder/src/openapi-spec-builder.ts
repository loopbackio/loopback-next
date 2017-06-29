// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  OpenApiSpec,
  OperationObject,
  ResponseObject,
  ParameterObject,
} from '@loopback/openapi-spec';

/**
 * Create a new instance of OpenApiSpecBuilder.
 *
 * @param basePath The base path on which the API is served.
 */
export function anOpenApiSpec(basePath?: string) {
  return new OpenApiSpecBuilder(basePath);
}

/**
 * Create a new instance of OperationSpecBuilder.
 */
export function anOperationSpec() {
  return new OperationSpecBuilder();
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
  withOperation(
    verb: string,
     path: string,
     spec: OperationObject | OperationSpecBuilder,
  ): this {
    if (spec instanceof OperationSpecBuilder) spec = spec.build();
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
    return this.withOperation(verb, path, anOperationSpec()
        .withOperationName(operationName)
        .withStringResponse(200));
  }

  /**
   * Build the OpenApiSpec object.
   */
  build(): OpenApiSpec {
    // TODO(bajtos): deep-clone
    return this._spec;
  }
}

/**
 * A builder for creating OperationObject specifications.
 */
export class OperationSpecBuilder {
  private _spec: OperationObject = {
    responses: {},
  };

  /**
   * Describe a response for a given HTTP status code.
   * @param status HTTP status code or string "default"
   * @param responseSpec Specification of the response
   */
  withResponse(status: number | 'default', responseSpec: ResponseObject): this {
    // OpenAPI spec uses string indices, i.e. 200 OK uses "200" as the index
    this._spec.responses[status.toString()] = responseSpec;
    return this;
  }

  withStringResponse(status: number | 'default' = 200): this {
    return this.withResponse(status, {
      description: 'The string result.',
      schema: {type: 'string'},
    });
  }

  /**
   * Describe a parameter accepted by the operation.
   * Note that parameters are positional in OpenAPI Spec, therefore
   * the first call of `withParameter` defines the first parameter,
   * the second call defines the second parameter, etc.
   * @param parameterSpec
   */
  withParameter(parameterSpec: ParameterObject): this {
    if (!this._spec.parameters) this._spec.parameters = [];
    this._spec.parameters.push(parameterSpec);
    return this;
  }

  /**
   * Define the operation name (controller method name).
   *
   * @param name The name of the controller method implementing this operation.
   */
  withOperationName(name: string): this {
    this._spec['x-operation-name'] = name;
    return this;
  }

  /**
   * Build the OperationObject object.
   */
  build(): OperationObject {
    // TODO(bajtos): deep-clone
    return this._spec;
  }
}
