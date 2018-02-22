// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v2
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ParameterObject,
  SchemaObject,
  ParameterLocation,
  ItemsObject,
  ItemType,
  ParameterType,
  ExtensionValue,
} from '@loopback/openapi-spec';

import {
  MetadataInspector,
  ParameterDecoratorFactory,
  MethodParameterDecoratorFactory,
} from '@loopback/context';

import {OAI2Keys} from './keys';
import {getSchemaForBodyParam, getTypeForNonBodyParam} from './generate-schema';

const paramDecoratorStyle = Symbol('ParamDecoratorStyle');

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
    descriptorOrIndex: TypedPropertyDescriptor<ExtensionValue> | number,
  ) {
    paramSpec = paramSpec || {};
    // Get the design time method parameter metadata
    const methodSig = MetadataInspector.getDesignTypeForMethod(target, member);
    const paramTypes = (methodSig && methodSig.parameterTypes) || [];

    const targetWithParamStyle = target as ExtensionValue;
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
        OAI2Keys.PARAMETERS_KEY,
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
        OAI2Keys.METHODS_WITH_PARAMETERS_KEY,
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
