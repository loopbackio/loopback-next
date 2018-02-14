import {RequestBodyObject} from '@loopback/openapi-spec-types';
import {MetadataInspector, ParameterDecoratorFactory} from '@loopback/context';
import {getSchemaForRequestBody, OAS3} from '../';
import * as _ from 'lodash';
import {inspect} from 'util';

const debug = require('debug')('loopback:rest:router:metadata');
export const REQUEST_BODY_INDEX = 'x-parameter-index';

/**
 * Describe the request body of a Controller method parameter.
 *
 * @param requestBodySpec The complete requestBody Object or partial of it.
 * "partial" for allowing no `content` in spec, for example:
 * ```
 * @requestBody({description: 'a request body'}) foo: Foo
 * ```
 */
export function requestBody(requestBodySpec?: Partial<RequestBodyObject>) {
  return function(target: Object, member: string | symbol, index: number) {
    // Use 'application/json' as default content if `requestBody` is undefined
    requestBodySpec = requestBodySpec || {content: {}};

    if (_.isEmpty(requestBodySpec.content))
      requestBodySpec.content = {'application/json': {}};

    // Get the design time method parameter metadata
    const methodSig = MetadataInspector.getDesignTypeForMethod(target, member);
    const paramTypes = (methodSig && methodSig.parameterTypes) || [];

    let paramType = paramTypes[index];
    let schema = getSchemaForRequestBody(paramType);
    requestBodySpec.content = _.mapValues(requestBodySpec.content, c => {
      c.schema = c.schema || schema;
      return c;
    });

    // The default position for request body argument is 0
    // if not, add extension 'x-parameter-index' to specify the position
    if (index !== 0) {
      requestBodySpec[REQUEST_BODY_INDEX] = index;
    }

    debug('requestBody member: ', member);
    debug('requestBody index: ', index);
    debug('requestBody spec: ', inspect(requestBodySpec, {depth: null}));
    ParameterDecoratorFactory.createDecorator<RequestBodyObject>(
      OAS3.REQUEST_BODY_KEY,
      requestBodySpec as RequestBodyObject,
    )(target, member, index);
  };
}
