// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
import {MethodMultiDecoratorFactory} from '@loopback/core';
import httpStatus from 'http-status';
import {
  ContentObject,
  ReferenceObject,
  ResponseObject,
  SchemaObject,
} from 'openapi3-ts';
import {OAI3Keys} from '../keys';
import {ResponseDecoratorMetadata, ResponseModelOrSpec} from '../types';

// overloading the definition because content cannot be undefined in this case.
interface ResponseWithContent extends ResponseObject {
  content: ContentObject;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isResponseObject(c: any): c is ResponseWithContent {
  // eslint-disable-next-line no-prototype-builtins
  return !!c && c.hasOwnProperty('content') && !!c.content;
}

function buildDecoratorReducer(
  responseCode: number,
  description: string,
  contentType = 'application/json',
) {
  const decoratorItemReducer = (
    r: ResponseDecoratorMetadata,
    m: ResponseModelOrSpec,
  ) => {
    // allow { content: { 'application/json': {...}}}
    if (isResponseObject(m)) {
      Object.keys(m.content ?? {}).forEach(ct => {
        r.push({
          responseCode,
          responseModelOrSpec: m.content[ct].schema as
            | SchemaObject
            | ReferenceObject,
          contentType: ct,
          description,
        });
      });
    } else {
      r.push({
        responseCode,
        responseModelOrSpec: m,
        // we're defaulting these for convenience for now.
        contentType,
        description,
      });
    }
    return r;
  };
  return decoratorItemReducer;
}

/**
 *  class MyController {
 *    @oas.response(200, FirstModel)
 *    @oas.response(404, OneError, { $ref: '#/definition...'})
 *    @oas.response(403, SecondError, { schema: ... })
 *  }
 *
 */
export function response(
  responseCode: number,
  ...responseModelOrSpec: ResponseModelOrSpec[]
) {
  const messageKey = String(responseCode) as keyof httpStatus.HttpStatus;

  return MethodMultiDecoratorFactory.createDecorator(
    OAI3Keys.RESPONSE_METHOD_KEY,
    responseModelOrSpec.reduce(
      buildDecoratorReducer(responseCode, httpStatus[messageKey] as string),
      [],
    ),
    {decoratorName: '@response', allowInheritance: false},
  );
}
