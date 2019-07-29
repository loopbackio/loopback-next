// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MetadataInspector, ParameterDecoratorFactory} from '@loopback/context';
import {JsonSchemaOptions} from '@loopback/repository-json-schema';
import * as _ from 'lodash';
import {inspect} from 'util';
import {isComplexType, getModelSchemaRef} from '../controller-spec';
import {resolveSchema} from '../generate-schema';
import {OAI3Keys} from '../keys';
import {RequestBodyObject, REQUEST_BODY_INDEX, SchemaObject} from '../types';

const debug = require('debug')('loopback:openapi3:metadata:requestbody');

function isRequestBodySpec<T extends object>(
  spec: Partial<RequestBodyObject> | JsonSchemaOptions<T>,
): spec is Partial<RequestBodyObject> {
  return (
    (spec as Partial<RequestBodyObject>).description !== undefined ||
    (spec as Partial<RequestBodyObject>).required !== undefined ||
    (spec as Partial<RequestBodyObject>).content !== undefined
  );
}

export function requestBody2<T extends object>(
  specOrModelOrOptions?:
    | Partial<RequestBodyObject>
    | Function
    | JsonSchemaOptions<T>,
  modelOrOptions?: Function | JsonSchemaOptions<T>,
  schemaOptions?: JsonSchemaOptions<T>,
) {
  if (typeof specOrModelOrOptions == 'function') {
    // omit the 1st param
    // @requestBody(modelCtor, schemaOptions)
    if (modelOrOptions && typeof modelOrOptions == 'object')
      return _requestBody2(
        {},
        specOrModelOrOptions,
        modelOrOptions as JsonSchemaOptions<T>,
      );
    // @requestBody(modelCtor)
    return _requestBody2({}, specOrModelOrOptions);
  } else if (specOrModelOrOptions && isRequestBodySpec(specOrModelOrOptions)) {
    // 1st param is spec
    if (modelOrOptions && typeof modelOrOptions == 'object')
      // omit the 2nd param
      // @requestBody(spec, schemaOptions)
      return _requestBody2(specOrModelOrOptions, undefined, modelOrOptions);
    // @requestBody(spec)
    // @requestBody(spec, modelCtor)
    // @requestBody(spec, modelCtor, schemaOptions)
    return _requestBody2(specOrModelOrOptions, modelOrOptions, schemaOptions);
  } else if (specOrModelOrOptions !== undefined) {
    // omit 1st and 2nd params
    // @requestBody(schemaOptions)
    return _requestBody2(
      {},
      undefined,
      specOrModelOrOptions as JsonSchemaOptions<T>,
    );
  } else {
    // no params
    // @requestBody()
    return _requestBody2();
  }
}

// `name` is provided to avoid generating the same schema
function _requestBody2<T extends object>(
  requestBodySpecification?: Partial<RequestBodyObject>,
  modelCtor?: Function,
  schemaOptions?: JsonSchemaOptions<T>,
) {
  return function(target: object, member: string, index: number) {
    debug('@newRequestBody() on %s.%s', target.constructor.name, member);
    debug('  parameter index: %s', index);
    /* istanbul ignore if */
    if (debug.enabled)
      debug(
        '  schemaOptions: %s',
        inspect(requestBodySpecification, {depth: null}),
      );

    // Use 'application/json' as default content if `requestBody` is undefined
    const requestBodySpec = Object.assign(
      {},
      requestBodySpecification || {content: {}},
    );

    if (_.isEmpty(requestBodySpec.content))
      requestBodySpec.content = {'application/json': {}};

    // Get the design time method parameter metadata
    const methodSig = MetadataInspector.getDesignTypeForMethod(target, member);
    const paramTypes = (methodSig && methodSig.parameterTypes) || [];

    const paramType = paramTypes[index];

    // // preserve backward compatibility
    // if (modelCtor)
    //   schemaOptions = Object.assign({}, schemaOptions);

    // Assumption: the paramType is always the type to be configured
    let schema: SchemaObject;

    if (isComplexType(modelCtor || paramType)) {
      schema = getModelSchemaRef(modelCtor || paramType, schemaOptions);
    } else {
      schema = resolveSchema(modelCtor || paramType);
    }

    /* istanbul ignore if */
    if (debug.enabled)
      debug('  inferred schema: %s', inspect(schema, {depth: null}));
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
      debug('  final spec: ', inspect(requestBodySpec, {depth: null}));
    ParameterDecoratorFactory.createDecorator<RequestBodyObject>(
      OAI3Keys.REQUEST_BODY_KEY,
      requestBodySpec as RequestBodyObject,
    )(target, member, index);
  };
}
