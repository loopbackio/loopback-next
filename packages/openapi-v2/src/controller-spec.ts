// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v2
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  MetadataInspector,
  ClassDecoratorFactory,
  MethodDecoratorFactory,
  ParameterDecoratorFactory,
  DecoratorFactory,
  MethodParameterDecoratorFactory,
} from '@loopback/context';

import {
  OperationObject,
  ParameterLocation,
  ParameterObject,
  SchemaObject,
  ParameterType,
  PathsObject,
  ItemType,
  ItemsObject,
  DefinitionsObject,
  MapObject,
} from '@loopback/openapi-spec';

import * as stream from 'stream';
import {includes} from 'lodash';
import {getJsonDef, JsonDefinition} from '@loopback/repository-json-schema';

const debug = require('debug')('loopback:rest:router:metadata');

const REST_METHODS_KEY = 'rest:methods';
const REST_METHODS_WITH_PARAMETERS_KEY = 'rest:methods:parameters';
const REST_PARAMETERS_KEY = 'rest:parameters';
const REST_CLASS_KEY = 'rest:class';
const REST_CONTROLLER_SPEC_KEY = 'rest:controller-spec';

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
 * Decorate the given Controller constructor with metadata describing
 * the HTTP/REST API the Controller implements/provides.
 *
 * `@api` can be applied to controller classes. For example,
 * ```
 * @api({basePath: '/my'})
 * class MyController {
 *   // ...
 * }
 * ```
 *
 * @param spec OpenAPI specification describing the endpoints
 * handled by this controller
 *
 * @decorator
 */
export function api(spec: ControllerSpec) {
  return ClassDecoratorFactory.createDecorator<ControllerSpec>(
    REST_CLASS_KEY,
    spec,
  );
}

/**
 * Data structure for REST related metadata
 */
interface RestEndpoint {
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
    REST_CLASS_KEY,
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
      REST_METHODS_KEY,
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
      REST_PARAMETERS_KEY,
      constructor.prototype,
      op,
    );
    if (params == null) {
      params = MetadataInspector.getMethodMetadata<ParameterObject[]>(
        REST_METHODS_WITH_PARAMETERS_KEY,
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
      operationSpec.parameters = params;
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

    debug(`  inferring schema definition for method %s`, op);
    const paramTypes = MetadataInspector.getDesignTypeForMethod(
      constructor.prototype,
      op,
    ).parameterTypes;

    const isComplexType = (p: Function) =>
      !includes([String, Number, Boolean, Array, Object], p) &&
      !isReadableStream(p);

    for (const p of paramTypes) {
      if (isComplexType(p)) {
        if (!spec.definitions) {
          spec.definitions = {};
        }
        const jsonDef = getJsonDef(p);
        spec.definitions[p.name] = jsonToSchemaObject(jsonDef);
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
    REST_CONTROLLER_SPEC_KEY,
    constructor,
    {ownMetadataOnly: true},
  );
  if (!spec) {
    spec = resolveControllerSpec(constructor);
    MetadataInspector.defineMetadata(
      REST_CONTROLLER_SPEC_KEY,
      spec,
      constructor,
    );
  }
  return spec;
}

export function jsonToSchemaObject(json: JsonDefinition): SchemaObject {
  const emptySchemaObj: SchemaObject = {};
  // tslint:disable-next-line:no-any
  const def: {[key: string]: any} = json;
  for (const property in def) {
    const val = def[property];
    switch (property) {
      // converts excepted properties to SchemaObject definitions
      case 'type': {
        if (def.type === 'array' && !def.items) {
          throw new Error(
            '"items" property must be present if "type" is an array',
          );
        }
        emptySchemaObj.type = Array.isArray(json.type)
          ? json.type[0]
          : json.type;
        break;
      }
      case 'allOf': {
        const collector: SchemaObject[] = [];
        for (const item of def.allOf) {
          collector.push(jsonToSchemaObject(item));
        }
        emptySchemaObj.allOf = collector;
        break;
      }
      case 'properties': {
        const properties: {[key: string]: JsonDefinition} = def.properties;
        const collector: MapObject<SchemaObject> = {};
        for (const item in properties) {
          collector[item] = jsonToSchemaObject(properties[item]);
        }
        emptySchemaObj.properties = collector;
        break;
      }
      case 'additionalProperties': {
        if (json.additionalProperties) {
          if (json.additionalProperties === true) {
            emptySchemaObj.additionalProperties = {};
          } else {
            emptySchemaObj.additionalProperties = jsonToSchemaObject(
              json.additionalProperties,
            );
          }
        }
        break;
      }
      case 'items': {
        def.items = Array.isArray(def.items) ? def.items[0] : def.items;
        emptySchemaObj.items = jsonToSchemaObject(def.items);
        break;
      }
      default: {
        emptySchemaObj[property] = val;
        break;
      }
    }
  }

  return <SchemaObject>emptySchemaObj;
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
  return operation('delete', path, spec);
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
  return MethodDecoratorFactory.createDecorator<Partial<RestEndpoint>>(
    REST_METHODS_KEY,
    {
      verb,
      path,
      spec,
    },
  );
}

const paramDecoratorStyle = Symbol('ParamDecoratorStyle');

/**
 * Check if the given type is `stream.Readable` or a subclasses of
 * `stream.Readable`
 * @param type JavaScript type function
 */
function isReadableStream(type: Object): boolean {
  if (typeof type !== 'function') return false;
  if (type === stream.Readable) return true;
  return isReadableStream(Object.getPrototypeOf(type));
}

/**
 * Get openapi type name for a JavaScript type
 * @param type JavaScript type
 */
function getTypeForNonBodyParam(type: Function): ParameterType {
  if (type === String) {
    return 'string';
  } else if (type === Number) {
    return 'number';
  } else if (type === Boolean) {
    return 'boolean';
  } else if (type === Array) {
    return 'array';
  } else if (isReadableStream(type)) {
    return 'file';
  }
  return 'string';
}

/**
 * Get openapi schema for a JavaScript type for a body parameter
 * @param type JavaScript type
 */
function getSchemaForBodyParam(type: Function): SchemaObject {
  const schema: SchemaObject = {};
  let typeName;
  if (type === String) {
    typeName = 'string';
  } else if (type === Number) {
    typeName = 'number';
  } else if (type === Boolean) {
    typeName = 'boolean';
  } else if (type === Array) {
    // item type cannot be inspected
    typeName = 'array';
  } else if (isReadableStream(type)) {
    typeName = 'file';
  } else if (type === Object) {
    typeName = 'object';
  }
  if (typeName) {
    schema.type = typeName;
  } else {
    schema.$ref = '#/definitions/' + type.name;
  }
  return schema;
}

/**
 * Describe an input parameter of a Controller method.
 *
 * `@param` can be applied to method itself or specific parameters. For example,
 * ```
 * class MyController {
 *   @get('/')
 *   @param(offsetSpec)
 *   @param(pageSizeSpec)
 *   list(offset?: number, pageSize?: number) {}
 * }
 * ```
 * or
 * ```
 * class MyController {
 *   @get('/')
 *   list(
 *     @param(offsetSpec) offset?: number,
 *     @param(pageSizeSpec) pageSize?: number,
 *   ) {}
 * }
 * ```
 * Please note mixed usage of `@param` at method/parameter level is not allowed.
 *
 * @param paramSpec Parameter specification.
 */
export function param(paramSpec: ParameterObject) {
  return function(
    target: Object,
    member: string | symbol,
    descriptorOrIndex: TypedPropertyDescriptor<any> | number,
  ) {
    paramSpec = paramSpec || {};
    // Get the design time method parameter metadata
    const methodSig = MetadataInspector.getDesignTypeForMethod(target, member);
    const paramTypes = (methodSig && methodSig.parameterTypes) || [];

    const targetWithParamStyle = target as any;
    if (typeof descriptorOrIndex === 'number') {
      if (targetWithParamStyle[paramDecoratorStyle] === 'method') {
        // This should not happen as parameter decorators are applied before
        // the method decorator
        /* istanbul ignore next */
        throw new Error(
          'Mixed usage of @param at method/parameter level' +
            ' is not allowed.',
        );
      }
      // Map design-time parameter type to the OpenAPI param type

      let paramType = paramTypes[descriptorOrIndex];
      if (paramType) {
        if (paramSpec.in !== 'body') {
          if (!paramSpec.type) {
            paramSpec.type = getTypeForNonBodyParam(paramType);
          }
        } else {
          paramSpec.schema = Object.assign(
            getSchemaForBodyParam(paramType),
            paramSpec.schema,
          );
        }
      }

      if (
        paramSpec.type === 'array' ||
        (paramSpec.schema && paramSpec.schema.type === 'array')
      ) {
        paramType = paramTypes[descriptorOrIndex];
        // The design-time type is `Object` for `any`
        if (paramType != null && paramType !== Object && paramType !== Array) {
          throw new Error(
            `The parameter type is set to 'array' but the JavaScript type is ${
              paramType.name
            }`,
          );
        }
      }
      targetWithParamStyle[paramDecoratorStyle] = 'parameter';
      ParameterDecoratorFactory.createDecorator<ParameterObject>(
        REST_PARAMETERS_KEY,
        paramSpec,
      )(target, member, descriptorOrIndex);
    } else {
      if (targetWithParamStyle[paramDecoratorStyle] === 'parameter') {
        throw new Error(
          'Mixed usage of @param at method/parameter level' +
            ' is not allowed.',
        );
      }
      targetWithParamStyle[paramDecoratorStyle] = 'method';
      RestMethodParameterDecoratorFactory.createDecorator<ParameterObject>(
        REST_METHODS_WITH_PARAMETERS_KEY,
        paramSpec,
      )(target, member, descriptorOrIndex);
    }
  };
}

class RestMethodParameterDecoratorFactory extends MethodParameterDecoratorFactory<
  ParameterObject
> {}

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
  export const body = function(name: string, schema?: SchemaObject) {
    return param({name, in: 'body', schema});
  };

  /**
   * Define a parameter of `array` type
   *
   * @example
   * ```ts
   * export class MyController {
   *   @get('/greet')
   *   greet(@param.array('names', 'query', 'string') names: string[]): string {
   *     return `Hello, ${names}`;
   *   }
   * }
   * ```
   * @param name Parameter name
   * @param source Source of the parameter value
   * @param itemSpec Item type for the array or the full item object
   */
  export const array = function(
    name: string,
    source: ParameterLocation,
    itemSpec: ItemType | ItemsObject,
  ) {
    const items = typeof itemSpec === 'string' ? {type: itemSpec} : itemSpec;
    if (source !== 'body') {
      return param({name, in: source, type: 'array', items});
    } else {
      return param({name, in: source, schema: {type: 'array', items}});
    }
  };
}

function createParamShortcut(source: ParameterLocation, type: ParameterType) {
  // TODO(bajtos) @param.IN.TYPE('foo', {required: true})
  return (name: string) => {
    return param({name, in: source, type});
  };
}
