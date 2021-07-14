// Copyright IBM Corp. 2017,2020. All Rights Reserved.
// Node module: @loopback/openapi-spec-builder
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import assert from 'assert';
import {
  CallbackObject,
  ComponentsObject,
  ExampleObject,
  HeaderObject,
  ISpecificationExtension,
  LinkObject,
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
  SchemaObject,
  SecuritySchemeObject,
} from 'openapi3-ts';

/**
 * Create a new instance of OpenApiSpecBuilder.
 *
 * @param basePath - The base path on which the API is served.
 */
export function anOpenApiSpec() {
  return new OpenApiSpecBuilder();
}

/**
 * Create a new instance of OperationSpecBuilder.
 */
export function anOperationSpec() {
  return new OperationSpecBuilder();
}

/**
 * Create a new instance of ComponentsSpecBuilder.
 */
export function aComponentsSpec() {
  return new ComponentsSpecBuilder();
}

export class BuilderBase<T extends ISpecificationExtension> {
  protected _spec: T;

  constructor(initialSpec: T) {
    this._spec = initialSpec;
  }

  /**
   * Add a custom (extension) property to the spec object.
   *
   * @param key - The property name starting with "x-".
   * @param value - The property value.
   */
  withExtension(
    key: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
  ): this {
    assert(
      key.startsWith('x-'),
      `Invalid extension ${key}, extension keys must be prefixed with "x-"`,
    );

    // `this._spec[key] = value;` is broken in TypeScript 3.5
    // See https://github.com/microsoft/TypeScript/issues/31661
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this._spec as Record<string, any>)[key] = value;
    return this;
  }

  /**
   * Build the spec object.
   */
  build(): T {
    // TODO(bajtos): deep-clone
    return this._spec;
  }
}
/**
 * A builder for creating OpenApiSpec documents.
 */
export class OpenApiSpecBuilder extends BuilderBase<OpenAPIObject> {
  /**
   * @param basePath - The base path on which the API is served.
   */
  constructor() {
    super({
      openapi: '3.0.0',
      info: {
        title: 'LoopBack Application',
        version: '1.0.0',
      },
      paths: {},
      servers: [{url: '/'}],
    });
  }

  /**
   * Define a new OperationObject at the given path and verb (method).
   *
   * @param verb - The HTTP verb.
   * @param path - The path relative to basePath.
   * @param spec - Additional specification of the operation.
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
   * @param verb - The HTTP verb.
   * @param path - The path relative to basePath.
   * @param operationName - The name of the controller method implementing
   * this operation (`x-operation-name` field).
   */
  withOperationReturningString(
    verb: string,
    path: string,
    operationName?: string,
  ): this {
    const spec = anOperationSpec().withStringResponse(200);
    if (operationName) spec.withOperationName(operationName);

    return this.withOperation(verb, path, spec);
  }

  /**
   * Define a new ComponentsObject.
   *
   * @param spec - Specification of the components.
   */
  withComponents(spec: ComponentsObject | ComponentsSpecBuilder): this {
    if (spec instanceof ComponentsSpecBuilder) spec = spec.build();
    if (!this._spec.components) this._spec.components = spec;
    return this;
  }
}

/**
 * A builder for creating OperationObject specifications.
 */
export class OperationSpecBuilder extends BuilderBase<OperationObject> {
  constructor() {
    super({
      responses: {'200': {description: 'An undocumented response body.'}},
    });
  }

  /**
   * Describe a response for a given HTTP status code.
   * @param status - HTTP status code or string "default"
   * @param responseSpec - Specification of the response
   */
  withResponse(status: number | 'default', responseSpec: ResponseObject): this {
    // OpenAPI spec uses string indices, i.e. 200 OK uses "200" as the index
    this._spec.responses[status.toString()] = responseSpec;
    return this;
  }

  withStringResponse(status: number | 'default' = 200): this {
    return this.withResponse(status, {
      description: 'The string result.',
      content: {
        'text/plain': {
          schema: {type: 'string'},
        },
      },
    });
  }

  /**
   * Describe one more parameters accepted by the operation.
   * Note that parameters are positional in OpenAPI Spec, therefore
   * the first call of `withParameter` defines the first parameter,
   * the second call defines the second parameter, etc.
   * @param parameterSpecs
   */
  withParameter(...parameterSpecs: ParameterObject[]): this {
    if (!this._spec.parameters) this._spec.parameters = [];
    this._spec.parameters.push(...parameterSpecs);
    return this;
  }

  withRequestBody(requestBodySpec: RequestBodyObject): this {
    this._spec.requestBody = requestBodySpec;
    return this;
  }

  /**
   * Define the operation name (controller method name).
   *
   * @param name - The name of the controller method implementing this operation.
   */
  withOperationName(name: string): this {
    this.withExtension('x-operation-name', name);
    this.setupOperationId();
    return this;
  }

  /**
   * Define the controller name (controller name).
   *
   * @param name - The name of the controller containing this operation.
   */
  withControllerName(name: string): this {
    this.withExtension('x-controller-name', name);
    this.setupOperationId();
    return this;
  }

  /**
   * Set up the `operationId` if not configured
   */
  private setupOperationId() {
    if (this._spec.operationId) return;
    const controllerName = this._spec['x-controller-name'];
    const operationName = this._spec['x-operation-name'];
    if (controllerName && operationName) {
      // Build the operationId as `<controllerName>.<operationName>`
      // Please note API explorer (https://github.com/swagger-api/swagger-js/)
      // will normalize it as `<controllerName>_<operationName>`
      this._spec.operationId = controllerName + '.' + operationName;
    }
  }

  /**
   * Define the operationId
   * @param operationId - Operation id
   */
  withOperationId(operationId: string): this {
    this._spec.operationId = operationId;
    return this;
  }

  /**
   * Describe tags associated with the operation
   * @param tags
   */
  withTags(tags: string | string[]): this {
    if (!this._spec.tags) this._spec.tags = [];
    if (typeof tags === 'string') tags = [tags];
    this._spec.tags.push(...tags);
    return this;
  }
}

/**
 * A builder for creating ComponentsObject specifications.
 */
export class ComponentsSpecBuilder extends BuilderBase<ComponentsObject> {
  constructor() {
    super({});
  }

  /**
   * Define a component schema.
   *
   * @param name - The name of the schema
   * @param schema - Specification of the schema
   *
   */
  withSchema(name: string, schema: SchemaObject | ReferenceObject): this {
    if (!this._spec.schemas) this._spec.schemas = {};
    this._spec.schemas[name] = schema;
    return this;
  }

  /**
   * Define a component response.
   *
   * @param name - The name of the response
   * @param response - Specification of the response
   *
   */
  withResponse(name: string, response: ResponseObject | ReferenceObject): this {
    if (!this._spec.responses) this._spec.responses = {};
    this._spec.responses[name] = response;
    return this;
  }

  /**
   * Define a component parameter.
   *
   * @param name - The name of the parameter
   * @param parameter - Specification of the parameter
   *
   */
  withParameter(
    name: string,
    parameter: ParameterObject | ReferenceObject,
  ): this {
    if (!this._spec.parameters) this._spec.parameters = {};
    this._spec.parameters[name] = parameter;
    return this;
  }

  /**
   * Define a component example.
   *
   * @param name - The name of the example
   * @param example - Specification of the example
   *
   */
  withExample(name: string, example: ExampleObject | ReferenceObject): this {
    if (!this._spec.examples) this._spec.examples = {};
    this._spec.examples[name] = example;
    return this;
  }

  /**
   * Define a component request body.
   *
   * @param name - The name of the request body
   * @param requestBody - Specification of the request body
   *
   */
  withRequestBody(
    name: string,
    requestBody: RequestBodyObject | ReferenceObject,
  ): this {
    if (!this._spec.requestBodies) this._spec.requestBodies = {};
    this._spec.requestBodies[name] = requestBody;
    return this;
  }

  /**
   * Define a component header.
   *
   * @param name - The name of the header
   * @param header - Specification of the header
   *
   */
  withHeader(name: string, header: HeaderObject | ReferenceObject): this {
    if (!this._spec.headers) this._spec.headers = {};
    this._spec.headers[name] = header;
    return this;
  }

  /**
   * Define a component security scheme.
   *
   * @param name - The name of the security scheme
   * @param securityScheme - Specification of the security scheme
   *
   */
  withSecurityScheme(
    name: string,
    securityScheme: SecuritySchemeObject | ReferenceObject,
  ): this {
    if (!this._spec.securitySchemes) this._spec.securitySchemes = {};
    this._spec.securitySchemes[name] = securityScheme;
    return this;
  }

  /**
   * Define a component link.
   *
   * @param name - The name of the link
   * @param link - Specification of the link
   *
   */
  withLink(name: string, link: LinkObject | ReferenceObject): this {
    if (!this._spec.links) this._spec.links = {};
    this._spec.links[name] = link;
    return this;
  }

  /**
   * Define a component callback.
   *
   * @param name - The name of the callback
   * @param callback - Specification of the callback
   *
   */
  withCallback(name: string, callback: CallbackObject | ReferenceObject): this {
    if (!this._spec.callbacks) this._spec.callbacks = {};
    this._spec.callbacks[name] = callback;
    return this;
  }
}
