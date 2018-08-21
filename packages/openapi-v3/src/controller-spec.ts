// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MetadataInspector, DecoratorFactory} from '@loopback/context';

import {
  OperationObject,
  ParameterObject,
  PathObject,
  ComponentsObject,
  RequestBodyObject,
} from '@loopback/openapi-v3-types';
import {getJsonSchema} from '@loopback/repository-json-schema';
import {OAI3Keys} from './keys';
import {jsonToSchemaObject} from './json-to-schema';
import * as _ from 'lodash';

const debug = require('debug')('loopback:openapi3:metadata');

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

/**
 * Build the api spec from class and method level decorations
 * @param constructor Controller class
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

    let operationSpec = endpoint.spec;
    if (!operationSpec) {
      // The operation was defined via @operation(verb, path) with no spec
      operationSpec = {
        responses: {},
      };
      endpoint.spec = operationSpec;
    }
    debug('  operation for method %s: %j', op, endpoint);

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
       * might be sparsed. For example,
       * ```ts
       * class MyController {
       *   greet(
       *     @inject('prefix') prefix: string,
       *     @param.query.string('name) name: string) {
       *      return `${prefix}`, ${name}`;
       *   }
       * ```
       */
      operationSpec.parameters = params.filter(p => p != null).map(p => {
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
      }
    }

    operationSpec['x-operation-name'] = op;

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
        if (!spec.components) {
          spec.components = {};
        }
        if (!spec.components.schemas) {
          spec.components.schemas = {};
        }
        if (p.name in spec.components.schemas) {
          // Preserve user-provided definitions
          debug(
            '    skipping parameter type %j as already defined',
            p.name || p,
          );
          continue;
        }
        const jsonSchema = getJsonSchema(p);
        const openapiSchema = jsonToSchemaObject(jsonSchema);
        const outputSchemas = spec.components.schemas;
        if (openapiSchema.definitions) {
          for (const key in openapiSchema.definitions) {
            // Preserve user-provided definitions
            if (key in outputSchemas) continue;
            const relatedSchema = openapiSchema.definitions[key];
            debug(
              '    defining referenced schema for %j: %j',
              key,
              relatedSchema,
            );
            outputSchemas[key] = relatedSchema;
          }
          delete openapiSchema.definitions;
        }

        debug('    defining schema for %j: %j', p.name, openapiSchema);
        outputSchemas[p.name] = openapiSchema;
        break;
      }
    }
  }
  return spec;
}

/**
 * Get the controller spec for the given class
 * @param constructor Controller class
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
