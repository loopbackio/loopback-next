// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DecoratorFactory, MetadataInspector} from '@loopback/context';
import {
  getJsonSchema,
  getJsonSchemaRef,
  JsonSchemaOptions,
} from '@loopback/repository-json-schema';
import * as _ from 'lodash';
import {resolveSchema} from './generate-schema';
import {jsonToSchemaObject, SchemaRef} from './json-to-schema';
import {OAI3Keys} from './keys';
import {
  ComponentsObject,
  ISpecificationExtension,
  isReferenceObject,
  OperationObject,
  ParameterObject,
  PathObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
  SchemaObject,
  SchemasObject,
} from './types';

const debug = require('debug')('loopback:openapi3:metadata:controller-spec');

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
  paths: PathObject;

  /**
   * OpenAPI components.schemas generated from model metadata
   */
  components?: ComponentsObject;
}

/**
 * Data structure for REST related metadata
 */
export interface RestEndpoint {
  verb: string;
  path: string;
  spec?: OperationObject;
}

export const TS_TYPE_KEY = 'x-ts-type';

/**
 * Build the api spec from class and method level decorations
 * @param constructor - Controller class
 */
function resolveControllerSpec(constructor: Function): ControllerSpec {
  debug(`Retrieving OpenAPI specification for controller ${constructor.name}`);

  let spec = MetadataInspector.getClassMetadata<ControllerSpec>(
    OAI3Keys.CLASS_KEY,
    constructor,
  );
  if (spec) {
    debug('  using class-level spec defined via @api()', spec);
    spec = DecoratorFactory.cloneDeep(spec);
  } else {
    spec = {paths: {}};
  }

  let endpoints =
    MetadataInspector.getAllMethodMetadata<RestEndpoint>(
      OAI3Keys.METHODS_KEY,
      constructor.prototype,
    ) || {};

  endpoints = DecoratorFactory.cloneDeep(endpoints);
  for (const op in endpoints) {
    debug('  processing method %s', op);

    const endpoint = endpoints[op];
    const verb = endpoint.verb!;
    const path = endpoint.path!;

    let endpointName = '';
    /* istanbul ignore if */
    if (debug.enabled) {
      const className = constructor.name || '<AnonymousClass>';
      const fullMethodName = `${className}.${op}`;
      endpointName = `${fullMethodName} (${verb} ${path})`;
    }

    const defaultResponse = {
      '200': {
        description: `Return value of ${constructor.name}.${op}`,
      },
    };

    let operationSpec = endpoint.spec;
    if (!operationSpec) {
      // The operation was defined via @operation(verb, path) with no spec
      operationSpec = {
        responses: defaultResponse,
      };
      endpoint.spec = operationSpec;
    }
    debug('  operation for method %s: %j', op, endpoint);

    debug('  spec responses for method %s: %o', op, operationSpec.responses);

    for (const code in operationSpec.responses) {
      const responseObject: ResponseObject | ReferenceObject =
        operationSpec.responses[code];
      if (isReferenceObject(responseObject)) continue;
      const content = responseObject.content || {};
      for (const c in content) {
        debug('  processing response code %s with content-type %', code, c);
        processSchemaExtensions(spec, content[c].schema);
      }
    }

    debug('  processing parameters for method %s', op);
    let params = MetadataInspector.getAllParameterMetadata<ParameterObject>(
      OAI3Keys.PARAMETERS_KEY,
      constructor.prototype,
      op,
    );

    debug('  parameters for method %s: %j', op, params);
    if (params != null) {
      params = DecoratorFactory.cloneDeep<ParameterObject[]>(params);
      /**
       * If a controller method uses dependency injection, the parameters
       * might be sparse. For example,
       * ```ts
       * class MyController {
       *   greet(
       *     @inject('prefix') prefix: string,
       *     @param.query.string('name) name: string) {
       *      return `${prefix}`, ${name}`;
       *   }
       * ```
       */
      operationSpec.parameters = params
        .filter(p => p != null)
        .map(p => {
          // Per OpenAPI spec, `required` must be `true` for path parameters
          if (p.in === 'path') {
            p.required = true;
          }
          return p;
        });
    }

    debug('  processing requestBody for method %s', op);
    let requestBodies = MetadataInspector.getAllParameterMetadata<
      RequestBodyObject
    >(OAI3Keys.REQUEST_BODY_KEY, constructor.prototype, op);

    if (requestBodies != null)
      requestBodies = requestBodies.filter(p => p != null);
    let requestBody: RequestBodyObject;

    if (requestBodies) {
      if (requestBodies.length > 1)
        throw new Error(
          'An operation should only have one parameter decorated by @requestBody',
        );

      requestBody = requestBodies[0];
      debug('  requestBody for method %s: %j', op, requestBody);
      if (requestBody) {
        operationSpec.requestBody = requestBody;

        const content = requestBody.content || {};
        for (const mediaType in content) {
          processSchemaExtensions(spec, content[mediaType].schema);
        }
      }
    }

    operationSpec['x-operation-name'] = op;
    operationSpec['x-controller-name'] =
      operationSpec['x-controller-name'] || constructor.name;

    if (operationSpec.operationId == null) {
      // Build the operationId as `<controllerName>.<operationName>`
      // Please note API explorer (https://github.com/swagger-api/swagger-js/)
      // will normalize it as `<controllerName>_<operationName>`
      operationSpec.operationId =
        operationSpec['x-controller-name'] +
        '.' +
        operationSpec['x-operation-name'];
    }

    if (!spec.paths[path]) {
      spec.paths[path] = {};
    }

    if (spec.paths[path][verb]) {
      // Operations from subclasses override those from the base
      debug(`  Overriding ${endpointName} - endpoint was already defined`);
    }

    debug(`  adding ${endpointName}`, operationSpec);
    spec.paths[path][verb] = operationSpec;

    debug(`  inferring schema object for method %s`, op);
    const opMetadata = MetadataInspector.getDesignTypeForMethod(
      constructor.prototype,
      op,
    );
    const paramTypes = opMetadata.parameterTypes;

    const isComplexType = (ctor: Function) =>
      !_.includes([String, Number, Boolean, Array, Object], ctor);

    for (const p of paramTypes) {
      if (isComplexType(p)) {
        generateOpenAPISchema(spec, p);
      }
    }
  }
  return spec;
}

/**
 * Resolve the x-ts-type in the schema object
 * @param spec - Controller spec
 * @param schema - Schema object
 */
function processSchemaExtensions(
  spec: ControllerSpec,
  schema?: SchemaObject | (ReferenceObject & ISpecificationExtension),
) {
  debug('  processing extensions in schema: %j', schema);
  if (!schema) return;

  assignRelatedSchemas(spec, schema.definitions);
  delete schema.definitions;

  if (isReferenceObject(schema)) return;

  const tsType = schema[TS_TYPE_KEY];
  debug('  %s => %o', TS_TYPE_KEY, tsType);
  if (tsType) {
    schema = resolveSchema(tsType, schema);
    if (schema.$ref) generateOpenAPISchema(spec, tsType);

    // We don't want a Function type in the final spec.
    delete schema[TS_TYPE_KEY];
    return;
  }
  if (schema.type === 'array') {
    processSchemaExtensions(spec, schema.items);
  } else if (schema.type === 'object') {
    if (schema.properties) {
      for (const p in schema.properties) {
        processSchemaExtensions(spec, schema.properties[p]);
      }
    }
  }
}

/**
 * Generate json schema for a given x-ts-type
 * @param spec - Controller spec
 * @param tsType - TS Type
 */
function generateOpenAPISchema(spec: ControllerSpec, tsType: Function) {
  if (!spec.components) {
    spec.components = {};
  }
  if (!spec.components.schemas) {
    spec.components.schemas = {};
  }
  if (tsType.name in spec.components.schemas) {
    // Preserve user-provided definitions
    debug('    skipping type %j as already defined', tsType.name || tsType);
    return;
  }
  const jsonSchema = getJsonSchema(tsType);
  const openapiSchema = jsonToSchemaObject(jsonSchema);

  assignRelatedSchemas(spec, openapiSchema.definitions);
  delete openapiSchema.definitions;

  debug('    defining schema for %j: %j', tsType.name, openapiSchema);
  spec.components.schemas[tsType.name] = openapiSchema;
}

/**
 * Assign related schemas from definitions to the controller spec
 * @param spec - Controller spec
 * @param definitions - Schema definitions
 */
function assignRelatedSchemas(
  spec: ControllerSpec,
  definitions?: SchemasObject,
) {
  if (!definitions) return;
  debug(
    '    assigning related schemas: ',
    definitions && Object.keys(definitions),
  );
  if (!spec.components) {
    spec.components = {};
  }
  if (!spec.components.schemas) {
    spec.components.schemas = {};
  }
  const outputSchemas = spec.components.schemas;

  for (const key in definitions) {
    // Preserve user-provided definitions
    if (key in outputSchemas) continue;
    const relatedSchema = definitions[key];
    debug('    defining referenced schema for %j: %j', key, relatedSchema);
    outputSchemas[key] = relatedSchema;
  }
}

/**
 * Get the controller spec for the given class
 * @param constructor - Controller class
 */
export function getControllerSpec(constructor: Function): ControllerSpec {
  let spec = MetadataInspector.getClassMetadata<ControllerSpec>(
    OAI3Keys.CONTROLLER_SPEC_KEY,
    constructor,
    {ownMetadataOnly: true},
  );
  if (!spec) {
    spec = resolveControllerSpec(constructor);
    MetadataInspector.defineMetadata(
      OAI3Keys.CONTROLLER_SPEC_KEY.key,
      spec,
      constructor,
    );
  }
  return spec;
}

/**
 * Describe the provided Model as a reference to a definition shared by multiple
 * endpoints. The definition is included in the returned schema.
 *
 * @example
 *
 * ```ts
 * const schema = {
 *   $ref: '#/components/schemas/Product',
 *   definitions: {
 *     Product: {
 *       title: 'Product',
 *       properties: {
 *         // etc.
 *       }
 *     }
 *   }
 * }
 * ```
 *
 * @param modelCtor - The model constructor (e.g. `Product`)
 * @param options - Additional options
 */
export function getModelSchemaRef<T extends object>(
  modelCtor: Function & {prototype: T},
  options?: JsonSchemaOptions<T>,
): SchemaRef {
  const jsonSchema = getJsonSchemaRef(modelCtor, options);
  return jsonToSchemaObject(jsonSchema) as SchemaRef;
}
