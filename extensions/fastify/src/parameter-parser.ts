// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/fastify
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  isReferenceObject,
  OperationObject,
  ParameterObject,
  REQUEST_BODY_INDEX,
} from '@loopback/openapi-v3';
import HttpErrors from 'http-errors';
import {Request} from './fastify.types';

export function parseOperationParameters(
  operationSpec: OperationObject,
  request: Request,
) {
  const args: unknown[] = [];

  let requestBodyIndex = -1;
  if (operationSpec.requestBody) {
    // the type of `operationSpec.requestBody` could be `RequestBodyObject`
    // or `ReferenceObject`, resolving a `$ref` value is not supported yet.
    if (isReferenceObject(operationSpec.requestBody)) {
      throw new Error('$ref requestBody is not supported yet.');
    }
    const i = operationSpec.requestBody[REQUEST_BODY_INDEX];
    requestBodyIndex = i ? i : 0;
  }

  for (const paramSpec of operationSpec.parameters ?? []) {
    if (isReferenceObject(paramSpec)) {
      // TODO(bajtos) implement $ref parameters
      // See https://github.com/strongloop/loopback-next/issues/435
      throw new Error('$ref parameters are not supported yet.');
    }
    const spec = paramSpec as ParameterObject;
    const value = getParamFromRequest(spec, request, request.params);
    args.push(value);
  }

  if (requestBodyIndex > -1) {
    args.splice(requestBodyIndex, 0, request.body);
  }
  return args;
}

type PathParameterValues = {[key: string]: unknown};

// Copied from packages/rest/src/parser.ts
// Do we want to share this helper, perhaps via `@loopback/openapi-v3` package?
function getParamFromRequest(
  spec: ParameterObject,
  request: Request,
  pathParams: PathParameterValues,
) {
  switch (spec.in) {
    case 'query':
      return request.query[spec.name];
    case 'path':
      return pathParams[spec.name];
    case 'header':
      return request.headers[spec.name.toLowerCase()];
    // TODO: Support `in: cookie`
    // See https://github.com/strongloop/loopback-next/issues/997
    default:
      return new HttpErrors.NotImplemented(
        `Parameters with "in: ${spec.in}" are not supported yet.`,
      );
  }
}
