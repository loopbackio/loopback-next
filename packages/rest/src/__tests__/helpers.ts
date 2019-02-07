// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ReferenceObject,
  RequestBodyObject,
  SchemaObject,
} from '@loopback/openapi-v3-types';
import {IncomingMessage} from 'http';
import {LogError} from '..';

export function createUnexpectedHttpErrorLogger(
  expectedStatusCode: number = 0,
): LogError {
  return function logUnexpectedHttpError(
    err: Error,
    statusCode: number,
    req: IncomingMessage,
  ) {
    if (statusCode === expectedStatusCode) return;

    console.error(
      'Unhandled error in %s %s: %s %s',
      req.method,
      req.url,
      statusCode,
      err.stack || err,
    );
  };
}

/**
 * Create an OpenAPI request body spec with the given content
 * @param schema The schema object
 * @param options Other attributes for the spec
 * @param mediaType Optional media type, default to `application/json`
 */
export function aBodySpec(
  schema: SchemaObject | ReferenceObject,
  options: Partial<RequestBodyObject> = {},
  mediaType: string = 'application/json',
): RequestBodyObject {
  const spec = Object.assign({}, options);
  spec.content = spec.content || {};
  Object.assign(spec.content, {
    [mediaType]: {
      schema: schema,
    },
  });
  return spec as RequestBodyObject;
}
