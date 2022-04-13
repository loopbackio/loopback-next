// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DecoratorFactory, MetadataInspector} from '@loopback/core';
import {
  getJsonSchema,
  getJsonSchemaRef,
  JsonSchemaOptions,
} from '@loopback/repository-json-schema';
import {includes} from 'lodash';
import {buildResponsesFromMetadata} from './build-responses-from-metadata';
import {REQUEST_BODY_INDEX} from './decorators';
import {resolveSchema} from './generate-schema';
import {jsonToSchemaObject, SchemaRef} from './json-to-schema';
import {OAI3Keys} from './keys';
import {
  ComponentsObject,
  ISpecificationExtension,
  isReferenceObject,
  OperationObject,
  OperationVisibility,
  ParameterObject,
  PathObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseDecoratorMetadata,
  ResponseObject,
  SchemaObject,
  SchemasObject,
  TagsDecoratorMetadata,
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

  const isClassDeprecated = MetadataInspector.getClassMetadata<boolean>(
    OAI3Keys.DEPRECATED_CLASS_KEY,
    constructor,
  );

  if (isClassDeprecated) {
    debug('  using class-level @deprecated()');
  }
  const classTags = MetadataInspector.getClassMetadata<TagsDecoratorMetadata>(
    OAI3Keys.TAGS_CLASS_KEY,
    constructor,
  );

  const classVisibility =
    MetadataInspector.getClassMetadata<OperationVisibility>(
      OAI3Keys.VISIBILITY_CLASS_KEY,
      constructor,
    );

  if (classVisibility) {
    debug(`  using class-level @oas.visibility(): '${classVisibility}'`);
  }

  if (classTags) {
    debug('  using class-level @oas.tags()');
  }

  if (classTags || isClassDeprecated || classVisibility) {
    for (const path of Object.keys(spec.paths)) {
      for (const method of Object.keys(spec.paths[path])) {
        /* istanbul ignore else */
        if (isClassDeprecated) {
          spec.paths[path][method].deprecated = true;
        }

        /* istanbul ignore else */
        if (classVisibility) {
          spec.paths[path][method]['x-visibility'] = classVisibility;
        }

        /* istanbul ignore else */
        if (classTags) {
          if (spec.paths[path][method].tags?.length) {
            spec.paths[path][method].tags = spec.paths[path][
              method
            ].tags.concat(classTags.tags);
          } else {
            spec.paths[path][method].tags = classTags.tags;
          }
        }
      }
    }
  }

  let endpoints =
    MetadataInspector.getAllMethodMetadata<RestEndpoint>(
      OAI3Keys.METHODS_KEY,
      constructor.prototype,
    ) ?? {};

  endpoints = DecoratorFactory.cloneDeep(endpoints);
  for (const op in endpoints) {
    debug('  processing method %s', op);

    const endpoint = endpoints[op];
    const verb = endpoint.verb!;
    const path = endpoint.path!;

    const isMethodDeprecated = MetadataInspector.getMethodMetadata<boolean>(
      OAI3Keys.DEPRECATED_METHOD_KEY,
      constructor.prototype,
      op,
    );
    if (isMethodDeprecated) {
      debug('  using method-level deprecation via @deprecated()');
    }

    const methodVisibility =
      MetadataInspector.getMethodMetadata<OperationVisibility>(
        OAI3Keys.VISIBILITY_METHOD_KEY,
        constructor.prototype,
        op,
      );

    if (methodVisibility) {
      debug(
        `  using method-level visibility via @visibility(): '${methodVisibility}'`,
      );
    }

    const methodTags =
      MetadataInspector.getMethodMetadata<TagsDecoratorMetadata>(
        OAI3Keys.TAGS_METHOD_KEY,
        constructor.prototype,
        op,
      );

    if (methodTags) {
      debug('  using method-level tags via @oas.tags()');
    }

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

    const decoratedResponses =
      MetadataInspector.getMethodMetadata<ResponseDecoratorMetadata>(
        OAI3Keys.RESPONSE_METHOD_KEY,
        constructor.prototype,
        op,
      );

    if (!operationSpec) {
      if (decoratedResponses) {
        operationSpec = buildResponsesFromMetadata(decoratedResponses);
      } else {
        // The operation was defined via @operation(verb, path) with no spec
        operationSpec = {
          responses: defaultResponse,
        };
      }
      endpoint.spec = operationSpec;
    } else if (decoratedResponses) {
      operationSpec.responses = buildResponsesFromMetadata(
        decoratedResponses,
        operationSpec,
      ).responses;
    }

    if (classTags && !operationSpec.tags) {
      operationSpec.tags = classTags.tags;
    }

    if (methodTags) {
      if (operationSpec.tags?.length) {
        operationSpec.tags = operationSpec.tags.concat(methodTags.tags);
      } else {
        operationSpec.tags = methodTags.tags;
      }
    }

    debug('  operation for method %s: %j', op, endpoint);

    debug('  spec responses for method %s: %o', op, operationSpec.responses);

    // Precedence: method decorator > class decorator > operationSpec > undefined
    const deprecationSpec =
      isMethodDeprecated ??
      isClassDeprecated ??
      operationSpec.deprecated ??
      false;

    if (deprecationSpec) {
      operationSpec.deprecated = true;
    }

    // Precedence: method decorator > class decorator > operationSpec > 'documented'
    const visibilitySpec: OperationVisibility =
      methodVisibility ?? classVisibility ?? operationSpec['x-visibility'];

    if (visibilitySpec) {
      operationSpec['x-visibility'] = visibilitySpec;
    }

    for (const code in operationSpec.responses) {
      const responseObject: ResponseObject | ReferenceObject =
        operationSpec.responses[code];
      if (isReferenceObject(responseObject)) continue;
      const content = responseObject.content ?? {};
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
    const paramIndexes: number[] = [];
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
        .filter((p, i) => {
          if (p == null) return false;
          paramIndexes.push(i);
          return true;
        })
        .map(p => {
          // Per OpenAPI spec, `required` must be `true` for path parameters
          if (p.in === 'path') {
            p.required = true;
          }
          return p;
        });
    }

    debug('  processing requestBody for method %s', op);
    let requestBodies =
      MetadataInspector.getAllParameterMetadata<RequestBodyObject>(
        OAI3Keys.REQUEST_BODY_KEY,
        constructor.prototype,
        op,
      );

    const bodyIndexes: number[] = [];
    if (requestBodies != null)
      requestBodies = requestBodies.filter((p, i) => {
        if (p == null) return false;
        bodyIndexes.push(i);
        return true;
      });
    let requestBody: RequestBodyObject;

    if (requestBodies) {
      if (requestBodies.length > 1)
        throw new Error(
          'An operation should only have one parameter decorated by @requestBody',
        );

      requestBody = requestBodies[0];
      debug('  requestBody for method %s: %j', op, requestBody);
      /* istanbul ignore else */
      if (requestBody) {
        // Find the relative index of the request body
        const bodyIndex = bodyIndexes[0];
        let index = 0;
        for (; index < paramIndexes.length; index++) {
          if (bodyIndex < paramIndexes[index]) break;
        }
        if (index !== 0) {
          requestBody[REQUEST_BODY_INDEX] = index;
        }
        operationSpec.requestBody = requestBody;

        /* istanbul ignore else */
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
    spec.paths[path][verb] = {...endpoint.spec, ...operationSpec};

    debug(`  inferring schema object for method %s`, op);
    const opMetadata = MetadataInspector.getDesignTypeForMethod(
      constructor.prototype,
      op,
    );
    const paramTypes = opMetadata?.parameterTypes ?? [];

    const isComplexType = (ctor: Function) =>
      !includes([String, Number, Boolean, Array, Object], ctor);

    for (const p of paramTypes) {
      if (isComplexType(p)) {
        generateOpenAPISchema(spec, p);
      }
    }
  }
  return spec;
}

declare type MixKey = 'allOf' | 'anyOf' | 'oneOf';
const SCHEMA_ARR_KEYS: MixKey[] = ['allOf', 'anyOf', 'oneOf'];

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

  /**
   * check if we have been provided a `not`
   * `not` is valid in many cases- here we're checking for
   * `not: { schema: {'x-ts-type': SomeModel }}
   */
  if (schema.not) {
    processSchemaExtensions(spec, schema.not);
  }

  /**
   *  check for schema.allOf, schema.oneOf, schema.anyOf arrays first.
   *  You cannot provide BOTH a defnintion AND one of these keywords.
   */
  /* istanbul ignore else */
  const hasOwn = (prop: string) =>
    schema != null && Object.prototype.hasOwnProperty.call(schema, prop);

  if (SCHEMA_ARR_KEYS.some(k => hasOwn(k))) {
    SCHEMA_ARR_KEYS.forEach((k: MixKey) => {
      /* istanbul ignore else */
      if (schema?.[k] && Array.isArray(schema[k])) {
        schema[k].forEach((r: (SchemaObject | ReferenceObject)[]) => {
          processSchemaExtensions(spec, r);
        });
      }
    });
  } else {
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
}

/**
 * Generate json schema for a given x-ts-type
 * @param spec - Controller spec
 * @param tsType - TS Type
 */
function generateOpenAPISchema(spec: ControllerSpec, tsType: Function) {
  spec.components = spec.components ?? {};
  spec.components.schemas = spec.components.schemas ?? {};
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
  spec.components = spec.components ?? {};
  spec.components.schemas = spec.components.schemas ?? {};
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
