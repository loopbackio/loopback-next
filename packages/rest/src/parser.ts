// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ServerRequest} from 'http';
import {HttpErrors} from './';
import {OperationObject, ParameterObject} from '@loopback/openapi-spec';
import {promisify} from '@loopback/core';
import {
  OperationArgs,
  ParsedRequest,
  PathParameterValues,
} from './internal-types';
import {ResolvedRoute} from './router/routing-table';
type HttpError = HttpErrors.HttpError;

type jsonBodyFn = (
  req: ServerRequest,
  cb: (err?: Error, body?: {}) => void,
) => void;
const jsonBody: jsonBodyFn = require('body/json');

// tslint:disable:no-any
type MaybeBody = any | undefined;
// tslint:enable:no-any

const parseJsonBody: (req: ServerRequest) => Promise<MaybeBody> = promisify(
  jsonBody,
);

/**
 * Get the content-type header value from the request
 * @param req Http request
 */
function getContentType(req: ServerRequest): string | undefined {
  const val = req.headers['content-type'];
  if (typeof val === 'string') {
    return val;
  } else if (Array.isArray(val)) {
    // Assume only one value is present
    return val[0];
  }
  return undefined;
}

/**
 * Parses the request to derive arguments to be passed in for the Application
 * controller method
 *
 * @param request Incoming HTTP request
 * @param operationSpec Swagger spec defined in the controller
 * @param pathParams Path parameters in incoming HTTP request
 */
export async function parseOperationArgs(
  request: ParsedRequest,
  route: ResolvedRoute,
): Promise<OperationArgs> {
  const operationSpec = route.spec;
  const pathParams = route.pathParams;
  const body = await loadRequestBodyIfNeeded(operationSpec, request);
  return buildOperationArguments(operationSpec, request, pathParams, body);
}

function loadRequestBodyIfNeeded(
  operationSpec: OperationObject,
  request: ServerRequest,
): Promise<MaybeBody> {
  if (!hasArgumentsFromBody(operationSpec)) return Promise.resolve();

  const contentType = getContentType(request);
  if (contentType && !/json/.test(contentType)) {
    const err = new HttpErrors.UnsupportedMediaType(
      `Content-type ${contentType} is not supported.`,
    );
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
    if (source === 'formData' || source === 'body') return true;
  }
  return false;
}

function buildOperationArguments(
  operationSpec: OperationObject,
  request: ParsedRequest,
  pathParams: PathParameterValues,
  body?: MaybeBody,
): OperationArgs {
  const args: OperationArgs = [];

  for (const paramSpec of operationSpec.parameters || []) {
    if ('$ref' in paramSpec) {
      // TODO(bajtos) implement $ref parameters
      // See https://github.com/strongloop/loopback-next/issues/435
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
          'Parameters with "in: ' + spec.in + '" are not supported yet.',
        );
    }
  }
  return args;
}
