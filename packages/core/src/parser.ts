// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ServerRequest} from 'http';
import {HttpErrors} from './';
import {OperationObject, ParameterObject} from '@loopback/openapi-spec';
import {promisify} from './promisify';
import {
  PathParameterValues,
  ParsedRequest,
} from './router/routing-table';

// tslint:disable:no-any
export type OperationArgs = any[];
// tslint:enable:no-any

type HttpError = HttpErrors.HttpError;

type jsonBodyFn = (req: ServerRequest, cb: (err?: Error, body?: {}) => void) => void;
const jsonBody: jsonBodyFn = require('body/json');

// tslint:disable:no-any
type MaybeBody = any | undefined;
// tslint:enable:no-any

const parseJsonBody: (req: ServerRequest) => Promise<MaybeBody> = promisify(jsonBody);

export async function parseOperationArgs(request: ParsedRequest, operationSpec: OperationObject, pathParams: PathParameterValues): Promise<OperationArgs> {
  const args: OperationArgs = [];
  const body = await loadRequestBodyIfNeeded(operationSpec, request);
  return buildOperationArguments(operationSpec, request, pathParams, body);
}

function loadRequestBodyIfNeeded(operationSpec: OperationObject, request: ServerRequest): Promise<MaybeBody> {
  if (!hasArgumentsFromBody(operationSpec))
    return Promise.resolve();

  const contentType = request.headers['content-type'];
  if (contentType && !/json/.test(contentType)) {
    const err = new HttpErrors.UnsupportedMediaType(
      `Content-type ${contentType} is not supported.`);
    return Promise.reject(err);
  }

  return parseJsonBody(request).catch((err: HttpError) => {
    err.statusCode = 400;
    return Promise.reject(err);
  });
}

function hasArgumentsFromBody(operationSpec: OperationObject): boolean {
  if (!operationSpec.parameters || !operationSpec.parameters.length)
   return false;

  for (const paramSpec of operationSpec.parameters) {
    if ('$ref' in paramSpec) continue;
    const source = (paramSpec as ParameterObject).in;
    if (source === 'formData' || source === 'body')
     return true;
  }
  return false;
}

function buildOperationArguments(operationSpec: OperationObject, request: ParsedRequest,
    pathParams: PathParameterValues, body?: MaybeBody): OperationArgs {
  const args: OperationArgs = [];

  for (const paramSpec of operationSpec.parameters || []) {
    if ('$ref' in paramSpec) {
      // TODO(bajtos) implement $ref parameters
      throw new Error('$ref parameters are not supported yet.');
    }
    const spec = paramSpec as ParameterObject;
    switch (spec.in) {
      case 'query':
        args.push(request.query[spec.name]);
        break;
      case 'path':
        args.push(pathParams[spec.name]);
        break;
      case 'header':
        args.push(request.headers[spec.name.toLowerCase()]);
        break;
      case 'formData':
        args.push(body ? body[spec.name] : undefined);
        break;
      case 'body':
        args.push(body);
        break;
      default:
        throw new HttpErrors.NotImplemented(
          'Parameters with "in: ' + spec.in + '" are not supported yet.');
    }
  }
  return args;
}
