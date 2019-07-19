// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { MetadataInspector, ParameterDecoratorFactory } from '@loopback/context';
import { JsonSchemaOptions } from '@loopback/repository-json-schema';
import * as _ from 'lodash';
import { inspect } from 'util';
import { TS_TYPE_KEY } from '../controller-spec';
import { resolveSchema } from '../generate-schema';
import { OAI3Keys } from '../keys';
import { RequestBodyObject, SchemaObject } from '../types';

const debug = require('debug')('loopback:openapi3:metadata:requestbody');
export const REQUEST_BODY_INDEX = 'x-parameter-index';

export type SchemaOptions = JsonSchemaOptions & {
  // If the schema options are provided, it implies
  // the default paramter type need to be configured,
  // so that `generateOpenAPISchema` can name the
  // generated schema as `schemaName`
  [TS_TYPE_KEY]?: Function,
  isVisited?: boolean,
}
// `name` is provided to avoid generating the same schema
export function newRequestBody1(
  requestBodySpecification?: Partial<RequestBodyObject>,
  schemaOptions?: SchemaOptions
) {
  return function (target: object, member: string, index: number) {
    debug('@newRequestBody() on %s.%s', target.constructor.name, member);
    debug('  parameter index: %s', index);
    /* istanbul ignore if */
    if (debug.enabled)
      debug('  schemaOptions: %s', inspect(requestBodySpecification, { depth: null }));

    // Use 'application/json' as default content if `requestBody` is undefined
    const requestBodySpec = Object.assign({}, requestBodySpecification || { content: {} });

    if (_.isEmpty(requestBodySpec.content))
      requestBodySpec.content = { 'application/json': {} };

    // Get the design time method parameter metadata
    const methodSig = MetadataInspector.getDesignTypeForMethod(target, member);
    const paramTypes = (methodSig && methodSig.parameterTypes) || [];

    const paramType = paramTypes[index];

    // Assumption: the paramType is always the type to be configured
    let schema: SchemaObject;
    if (schemaOptions) {
      schema = resolveSchema(paramType, undefined, schemaOptions)
    } else {
      schema = resolveSchema(paramType);
    }
    /* istanbul ignore if */
    if (debug.enabled)
      debug('  inferred schema: %s', inspect(schema, { depth: null }));
    requestBodySpec.content = _.mapValues(requestBodySpec.content, c => {
      if (!c.schema) {
        c.schema = schema;
      }
      return c;
    });

    // The default position for request body argument is 0
    // if not, add extension 'x-parameter-index' to specify the position
    if (index !== 0) {
      requestBodySpec[REQUEST_BODY_INDEX] = index;
    }

    /* istanbul ignore if */
    if (debug.enabled)
      debug('  final spec: ', inspect(requestBodySpec, { depth: null }));
    ParameterDecoratorFactory.createDecorator<RequestBodyObject>(
      OAI3Keys.REQUEST_BODY_KEY,
      requestBodySpec as RequestBodyObject,
    )(target, member, index);
  };
}
