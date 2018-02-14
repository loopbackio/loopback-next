import {
  isSchemaObject,
  ParameterObject,
  ParameterLocation,
  ReferenceObject,
  SchemaObject,
} from '@loopback/openapi-spec-types';
import {MetadataInspector, ParameterDecoratorFactory} from '@loopback/context';
import {getSchemaForParam, OAS3} from '../';

/**
 * Describe an input parameter of a Controller method.
 *
 * `@param` must be applied to parameters. For example,
 * ```
 * class MyController {
 *   @get('/')
 *   list(
 *     @param(offsetSpec) offset?: number,
 *     @param(pageSizeSpec) pageSize?: number,
 *   ) {}
 * }
 * ```
 *
 * @param paramSpec Parameter specification.
 */
export function param(paramSpec: ParameterObject) {
  return function(
    target: Object,
    member: string | symbol,
    // deprecate method level decorator
    index: number,
  ) {
    paramSpec = paramSpec || {};
    // Get the design time method parameter metadata
    const methodSig = MetadataInspector.getDesignTypeForMethod(target, member);
    const paramTypes = (methodSig && methodSig.parameterTypes) || [];

    // Map design-time parameter type to the OpenAPI param type

    let paramType = paramTypes[index];

    if (paramType) {
      if (
        !paramSpec.schema ||
        (isSchemaObject(paramSpec.schema) && !paramSpec.schema.type)
      ) {
        paramSpec.schema = getSchemaForParam(paramType, paramSpec.schema || {});
      }
    }

    if (
      paramSpec.schema &&
      isSchemaObject(paramSpec.schema) &&
      paramSpec.schema.type === 'array'
    ) {
      // The design-time type is `Object` for `any`
      if (paramType != null && paramType !== Object && paramType !== Array) {
        throw new Error(
          `The parameter type is set to 'array' but the JavaScript type is ${
            paramType.name
          }`,
        );
      }
    }

    ParameterDecoratorFactory.createDecorator<ParameterObject>(
      OAS3.PARAMETERS_KEY,
      paramSpec,
    )(target, member, index);
  };
}

/**
 * The `type` and `format` inferred by a common name of OpenAPI 3.0.0 data type
 * reference link:
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#data-types
 */
const typeAndFormatMap = {
  integer: {type: 'integer', format: 'int32'},
  long: {type: 'integer', format: 'int64'},
  float: {type: 'number', format: 'float'},
  double: {type: 'number', format: 'double'},
  byte: {type: 'string', format: 'byte'},
  binary: {type: 'string', format: 'binary'},
  date: {type: 'string', format: 'date'},
  dateTime: {type: 'string', format: 'date-time'},
  password: {type: 'string', format: 'password'},
};

/**
 * Shortcut parameter decorators
 */
export namespace param {
  export const query = {
    /**
     * @param.query.string('paramName')
     */
    string: createParamShortCut('query', 'string'),
    /**
     * @param.query.number('paramName')
     */
    number: createParamShortCut('query', 'number'),
    /**
     * @param.query.boolean('paramName')
     */
    boolean: createParamShortCut('query', 'boolean'),
    /**
     * @param.query.integer('paramName')
     */
    integer: createParamShortCut(
      'query',
      typeAndFormatMap.integer.type,
      typeAndFormatMap.integer.format,
    ),
    /**
     * @param.query.long('paramName')
     */
    long: createParamShortCut(
      'query',
      typeAndFormatMap.long.type,
      typeAndFormatMap.long.format,
    ),
    /**
     * @param.query.float('paramName')
     */
    float: createParamShortCut(
      'query',
      typeAndFormatMap.float.type,
      typeAndFormatMap.float.format,
    ),
    /**
     * @param.query.double('paramName')
     */
    double: createParamShortCut(
      'query',
      typeAndFormatMap.double.type,
      typeAndFormatMap.double.format,
    ),
    /**
     * @param.query.byte('paramName')
     */
    byte: createParamShortCut(
      'query',
      typeAndFormatMap.byte.type,
      typeAndFormatMap.byte.format,
    ),
    /**
     * @param.query.binary('paramName')
     */
    binary: createParamShortCut(
      'query',
      typeAndFormatMap.binary.type,
      typeAndFormatMap.binary.format,
    ),
    /**
     * @param.query.date('paramName')
     */
    date: createParamShortCut(
      'query',
      typeAndFormatMap.date.type,
      typeAndFormatMap.date.format,
    ),
    /**
     * @param.query.dateTime('paramName')
     */
    dateTime: createParamShortCut(
      'query',
      typeAndFormatMap.dateTime.type,
      typeAndFormatMap.dateTime.format,
    ),
    /**
     * @param.query.password('paramName')
     */
    password: createParamShortCut(
      'query',
      typeAndFormatMap.password.type,
      typeAndFormatMap.password.format,
    ),
  };
  export const cookie = {
    /**
     * @param.cookie.string('paramName')
     */
    string: createParamShortCut('cookie', 'string'),
    /**
     * @param.cookie.number('paramName')
     */
    number: createParamShortCut('cookie', 'number'),
    /**
     * @param.cookie.boolean('paramName')
     */
    boolean: createParamShortCut('cookie', 'boolean'),
    /**
     * @param.cookie.integer('paramName')
     */
    integer: createParamShortCut(
      'cookie',
      typeAndFormatMap.integer.type,
      typeAndFormatMap.integer.format,
    ),
    /**
     * @param.cookie.long('paramName')
     */
    long: createParamShortCut(
      'cookie',
      typeAndFormatMap.long.type,
      typeAndFormatMap.long.format,
    ),
    /**
     * @param.cookie.float('paramName')
     */
    float: createParamShortCut(
      'cookie',
      typeAndFormatMap.float.type,
      typeAndFormatMap.float.format,
    ),
    /**
     * @param.cookie.double('paramName')
     */
    double: createParamShortCut(
      'cookie',
      typeAndFormatMap.double.type,
      typeAndFormatMap.double.format,
    ),
    /**
     * @param.cookie.byte('paramName')
     */
    byte: createParamShortCut(
      'cookie',
      typeAndFormatMap.byte.type,
      typeAndFormatMap.byte.format,
    ),
    /**
     * @param.cookie.binary('paramName')
     */
    binary: createParamShortCut(
      'cookie',
      typeAndFormatMap.binary.type,
      typeAndFormatMap.binary.format,
    ),
    /**
     * @param.cookie.date('paramName')
     */
    date: createParamShortCut(
      'cookie',
      typeAndFormatMap.date.type,
      typeAndFormatMap.date.format,
    ),
    /**
     * @param.cookie.dateTime('paramName')
     */
    dateTime: createParamShortCut(
      'cookie',
      typeAndFormatMap.dateTime.type,
      typeAndFormatMap.dateTime.format,
    ),
    /**
     * @param.cookie.password('paramName')
     */
    password: createParamShortCut(
      'cookie',
      typeAndFormatMap.password.type,
      typeAndFormatMap.password.format,
    ),
  };
  export const header = {
    /**
     * @param.header.string('paramName')
     */
    string: createParamShortCut('header', 'string'),
    /**
     * @param.header.number('paramName')
     */
    number: createParamShortCut('header', 'number'),
    /**
     * @param.header.boolean('paramName')
     */
    boolean: createParamShortCut('header', 'boolean'),
    /**
     * @param.header.integer('paramName')
     */
    integer: createParamShortCut(
      'header',
      typeAndFormatMap.integer.type,
      typeAndFormatMap.integer.format,
    ),
    /**
     * @param.header.long('paramName')
     */
    long: createParamShortCut(
      'header',
      typeAndFormatMap.long.type,
      typeAndFormatMap.long.format,
    ),
    /**
     * @param.header.float('paramName')
     */
    float: createParamShortCut(
      'header',
      typeAndFormatMap.float.type,
      typeAndFormatMap.float.format,
    ),
    /**
     * @param.header.double('paramName')
     */
    double: createParamShortCut(
      'header',
      typeAndFormatMap.double.type,
      typeAndFormatMap.double.format,
    ),
    /**
     * @param.header.byte('paramName')
     */
    byte: createParamShortCut(
      'header',
      typeAndFormatMap.byte.type,
      typeAndFormatMap.byte.format,
    ),
    /**
     * @param.header.binary('paramName')
     */
    binary: createParamShortCut(
      'header',
      typeAndFormatMap.binary.type,
      typeAndFormatMap.binary.format,
    ),
    /**
     * @param.header.date('paramName')
     */
    date: createParamShortCut(
      'header',
      typeAndFormatMap.date.type,
      typeAndFormatMap.date.format,
    ),
    /**
     * @param.header.dateTime('paramName')
     */
    dateTime: createParamShortCut(
      'header',
      typeAndFormatMap.dateTime.type,
      typeAndFormatMap.dateTime.format,
    ),
    /**
     * @param.header.password('paramName')
     */
    password: createParamShortCut(
      'header',
      typeAndFormatMap.password.type,
      typeAndFormatMap.password.format,
    ),
  };
  export const path = {
    /**
     * @param.path.string('paramName')
     */
    string: createParamShortCut('path', 'string'),
    /**
     * @param.path.number('paramName')
     */
    number: createParamShortCut('path', 'number'),
    /**
     * @param.path.boolean('paramName')
     */
    boolean: createParamShortCut('path', 'boolean'),
    /**
     * @param.path.integer('paramName')
     */
    integer: createParamShortCut(
      'path',
      typeAndFormatMap.integer.type,
      typeAndFormatMap.integer.format,
    ),
    /**
     * @param.path.long('paramName')
     */
    long: createParamShortCut(
      'path',
      typeAndFormatMap.long.type,
      typeAndFormatMap.long.format,
    ),
    /**
     * @param.path.float('paramName')
     */
    float: createParamShortCut(
      'path',
      typeAndFormatMap.float.type,
      typeAndFormatMap.float.format,
    ),
    /**
     * @param.path.double('paramName')
     */
    double: createParamShortCut(
      'path',
      typeAndFormatMap.double.type,
      typeAndFormatMap.double.format,
    ),
    /**
     * @param.path.byte('paramName')
     */
    byte: createParamShortCut(
      'path',
      typeAndFormatMap.byte.type,
      typeAndFormatMap.byte.format,
    ),
    /**
     * @param.path.binary('paramName')
     */
    binary: createParamShortCut(
      'path',
      typeAndFormatMap.binary.type,
      typeAndFormatMap.binary.format,
    ),
    /**
     * @param.path.date('paramName')
     */
    date: createParamShortCut(
      'path',
      typeAndFormatMap.date.type,
      typeAndFormatMap.date.format,
    ),
    /**
     * @param.path.dateTime('paramName')
     */
    dateTime: createParamShortCut(
      'path',
      typeAndFormatMap.dateTime.type,
      typeAndFormatMap.dateTime.format,
    ),
    /**
     * @param.path.password('paramName')
     */
    password: createParamShortCut(
      'path',
      typeAndFormatMap.password.type,
      typeAndFormatMap.password.format,
    ),
  };
  /**
   * @param.array('paramName', 'query', {type: string})
   */
  export const array = function(
    name: string,
    source: ParameterLocation,
    itemSpec: SchemaObject | ReferenceObject,
  ) {
    return param({
      name,
      in: source,
      schema: {type: 'array', items: itemSpec},
    });
  };
}

function createParamShortCut(
  source: ParameterLocation,
  type: string,
  format?: string,
) {
  if (format) {
    return (name: string) => {
      return param({name, in: source, schema: {type, format}});
    };
  } else {
    return (name: string) => {
      return param({name, in: source, schema: {type}});
    };
  }
}
