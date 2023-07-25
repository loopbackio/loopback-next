// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MetadataInspector, ParameterDecoratorFactory} from '@loopback/core';
import _ from 'lodash';
import {inspect} from 'util';
import {resolveSchema} from '../generate-schema';
import {OAI3Keys} from '../keys';
import {ReferenceObject, RequestBodyObject, SchemaObject} from '../types';

const debug = require('debug')('loopback:openapi3:metadata:requestbody');
export const REQUEST_BODY_INDEX = 'x-parameter-index';

/**
 * Describe the request body of a Controller method parameter.
 *
 * A typical OpenAPI requestBody spec contains property:
 * - `description`
 * - `required`
 * - `content`.
 *
 * @example
 * ```ts
 * requestBodySpec: {
 *   description: 'a user',
 *   required: true,
 *   content: {
 *     'application/json': {...schemaSpec},
 *     'application/text': {...schemaSpec},
 *   },
 * }
 * ```
 *
 * If the `content` object is not provided, this decorator sets it
 * as `application/json` by default.
 * If the `schema` object is not provided in a media type, this decorator
 * generates it for you based on the argument's type. In this case, please
 * make sure the argument type is a class decorated by `@model` from
 * `@loopback/repository`
 *
 * The simplest usage is:
 *
 * ```ts
 * class MyController {
 *   @post('/User')
 *   async create(@requestBody() user: User) {}
 * }
 * ```
 *
 * or with properties other than `content`
 *
 * ```ts
 * class MyController {
 *   @post('/User')
 *   async create(@requestBody({description: 'a user'}) user: User) {}
 * }
 * ```
 *
 * or to be more complicated, with your customized media type
 *
 * ```ts
 * class MyController {
 *   @post('/User')
 *   async create(@requestBody({
 *     description: 'a user',
 *     // leave the schema as empty object, the decorator will generate it.
 *     content: {'application/text': {}}
 *   }) user: User) {}
 * }
 * ```
 *
 * @param requestBodySpec - The complete requestBody object or partial of it.
 * "partial" for allowing no `content` in spec, for example:
 * ```
 * @requestBody({description: 'a request body'}) user: User
 * ```
 */
export function requestBody(requestBodySpec?: Partial<RequestBodyObject>) {
  return function (target: object, member: string, index: number) {
    debug('@requestBody() on %s.%s', target.constructor.name, member);
    debug('  parameter index: %s', index);
    /* istanbul ignore if */
    if (debug.enabled)
      debug('  options: %s', inspect(requestBodySpec, {depth: null}));

    // Use 'application/json' as default content if `requestBody` is undefined
    requestBodySpec = {content: {}, ...requestBodySpec};

    if (_.isEmpty(requestBodySpec.content))
      requestBodySpec.content = {'application/json': {}};

    // Get the design time method parameter metadata
    const methodSig = MetadataInspector.getDesignTypeForMethod(target, member);
    const paramTypes = methodSig?.parameterTypes || [];

    const paramType = paramTypes[index];
    const schema = resolveSchema(paramType);
    /* istanbul ignore if */
    if (debug.enabled)
      debug('  inferred schema: %s', inspect(schema, {depth: null}));
    requestBodySpec.content = _.mapValues(requestBodySpec.content, c => {
      if (!c.schema) {
        c.schema = schema;
      }
      return c;
    });

    /* istanbul ignore if */
    if (debug.enabled)
      debug('  final spec: ', inspect(requestBodySpec, {depth: null}));
    ParameterDecoratorFactory.createDecorator<RequestBodyObject>(
      OAI3Keys.REQUEST_BODY_KEY,
      requestBodySpec as RequestBodyObject,
      {decoratorName: '@requestBody'},
    )(target, member, index);
  };
}

export namespace requestBody {
  /**
   * Define a requestBody of `array` type.
   *
   * @example
   * ```ts
   * export class MyController {
   *   @post('/greet')
   *   greet(@requestBody.array(
   *     {type: 'string'},
   *     {description: 'an array of names', required: false}
   *   ) names: string[]): string {
   *     return `Hello, ${names}`;
   *   }
   * }
   * ```
   *
   * @param properties - The requestBody properties other than `content`
   * @param itemSpec - the full item object
   */
  export const array = (
    itemSpec: SchemaObject | ReferenceObject,
    properties?: {description?: string; required?: boolean},
  ) => {
    return requestBody({
      ...properties,
      content: {
        'application/json': {
          schema: {type: 'array', items: itemSpec},
        },
      },
    });
  };

  /**
   * Define a requestBody of `file` type. This is used to support
   * multipart/form-data based file upload. Use `@requestBody` for other content
   * types.
   *
   * {@link https://swagger.io/docs/specification/describing-request-body/file-upload | OpenAPI file upload}
   *
   * @example
   * import {Request} from '@loopback/rest';
   *
   * ```ts
   * class MyController {
   *   @post('/pictures')
   *   upload(
   *     @requestBody.file()
   *     request: Request,
   *   ) {
   *     // ...
   *   }
   * }
   * ```
   *
   * @param properties - Optional description and required flag
   */
  export const file = (properties?: {
    description?: string;
    required?: boolean;
  }) => {
    return requestBody({
      description: 'Request body for multipart/form-data based file upload',
      required: true,
      content: {
        // Media type for file upload
        'multipart/form-data': {
          // Skip body parsing
          'x-parser': 'stream',
          schema: {
            type: 'object',
            properties: {
              file: {
                type: 'string',
                // This is required by OpenAPI spec 3.x for file upload
                format: 'binary',
              },
              // Multiple file upload is not working with swagger-ui
              // https://github.com/swagger-api/swagger-ui/issues/4600
              /*
              files: {
                type: 'array',
                items: {
                  type: 'string',
                  format: 'binary',
                },
              },
              */
            },
          },
        },
      },
      ...properties,
    });
  };
}
