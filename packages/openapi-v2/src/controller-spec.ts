// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v2
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MetadataInspector, DecoratorFactory} from '@loopback/context';

import {
  OperationObject,
  ParameterObject,
  PathsObject,
  DefinitionsObject,
} from '@loopback/openapi-spec';

import {getJsonSchema} from '@loopback/repository-json-schema';
import {OAI2Keys} from './keys';
import {jsonToSchemaObject} from './json-to-schema';
import {isReadableStream} from './generate-schema';
import * as _ from 'lodash';

const debug = require('debug')('loopback:rest:router:metadata');

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

  /**
   * JSON Schema definitions of models used by the controller
   */
  definitions?: DefinitionsObject;
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
    OAI2Keys.CLASS_KEY,
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
      OAI2Keys.METHODS_KEY,
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
      OAI2Keys.PARAMETERS_KEY,
      constructor.prototype,
      op,
    );
    if (params == null) {
      params = MetadataInspector.getMethodMetadata<ParameterObject[]>(
        OAI2Keys.METHODS_WITH_PARAMETERS_KEY,
        constructor.prototype,
        op,
      );
    }
    debug('  parameters for method %s: %j', op, params);
    if (params != null) {
      const bodyParams = params.filter(p => p && p.in === 'body');
      if (bodyParams.length > 1) {
        throw new Error('More than one body parameters found: ' + bodyParams);
      }
      params = DecoratorFactory.cloneDeep(params);
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
      operationSpec.parameters = params.filter(p => p != null);
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
    const paramTypes = MetadataInspector.getDesignTypeForMethod(
      constructor.prototype,
      op,
    ).parameterTypes;

    const isComplexType = (ctor: Function) =>
      !_.includes([String, Number, Boolean, Array, Object], ctor) &&
      !isReadableStream(ctor);

    for (const p of paramTypes) {
      if (isComplexType(p)) {
        if (!spec.definitions) {
          spec.definitions = {};
        }
        const jsonSchema = getJsonSchema(p);
        const openapiSchema = jsonToSchemaObject(jsonSchema);

        if (openapiSchema.definitions) {
          for (const key in openapiSchema.definitions) {
            spec.definitions[key] = openapiSchema.definitions[key];
          }
          delete openapiSchema.definitions;
        }

        spec.definitions[p.name] = openapiSchema;
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
    OAI2Keys.CONTROLLER_SPEC_KEY,
    constructor,
    {ownMetadataOnly: true},
  );
  if (!spec) {
    spec = resolveControllerSpec(constructor);
    MetadataInspector.defineMetadata(
      OAI2Keys.CONTROLLER_SPEC_KEY,
      spec,
      constructor,
    );
  }
  return spec;
}
