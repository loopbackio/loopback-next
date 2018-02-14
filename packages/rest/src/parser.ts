// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ServerRequest} from 'http';
import * as HttpErrors from 'http-errors';
import {promisify} from 'util';
import {
  OperationObject,
  ParameterObject,
  RequestBodyObject,
} from '@loopback/openapi-spec-types';
import {
  OperationArgs,
  ParsedRequest,
  PathParameterValues,
} from './internal-types';
import {ResolvedRoute} from './router/routing-table';
import {REQUEST_BODY_INDEX} from '@loopback/openapi-v3';
const cookieParser = require('cookie').parse;
type HttpError = HttpErrors.HttpError;

// tslint:disable-next-line:no-any
type MaybeBody = any | undefined;

const parseJsonBody: (req: ServerRequest) => Promise<MaybeBody> = promisify(
  require('body/json'),
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
  return !!operationSpec.requestBody;
}

function buildOperationArguments(
  operationSpec: OperationObject,
  request: ParsedRequest,
  pathParams: PathParameterValues,
  body?: MaybeBody,
): OperationArgs {
  const args: OperationArgs = [];

  let requestBodyIndex: number = -1;
  if (hasArgumentsFromBody(operationSpec)) {
    const i = (<RequestBodyObject>operationSpec.requestBody)[
      REQUEST_BODY_INDEX
    ];
    requestBodyIndex = i ? i : 0;
  }

  const paramArgs: OperationArgs = [];
  for (const paramSpec of operationSpec.parameters || []) {
    if ('$ref' in paramSpec) {
      // TODO(bajtos) implement $ref parameters
      // See https://github.com/strongloop/loopback-next/issues/435
      throw new Error('$ref parameters are not supported yet.');
    }

    const spec = paramSpec as ParameterObject;
    switch (spec.in) {
      case 'query':
        paramArgs.push(request.query[spec.name]);
        break;
      case 'path':
        paramArgs.push(pathParams[spec.name]);
        break;
      case 'header':
        paramArgs.push(request.headers[spec.name.toLowerCase()]);
        break;
      case 'cookie':
        // For details about cookie format, please check:
        // https://www.npmjs.com/package/cookie
        let cookies = cookieParser(request.headers.cookie || '');
        paramArgs.push(cookies[spec.name]);
        break;
      // 'file' is not supported yet
      default:
        throw new HttpErrors.NotImplemented(
          'Parameters with "in: ' + spec.in + '" are not supported yet.',
        );
    }
  }

  insertRequestBody();
  return args;

  function insertRequestBody() {
    if (paramArgs.length === 0 && requestBodyIndex > -1) {
      args.push(body);
      return;
    }
    for (const arg of paramArgs) {
      if (paramArgs.indexOf(arg) === requestBodyIndex) args.push(body);
      args.push(arg);
    }
    if (paramArgs.length === requestBodyIndex) args.push(body);
  }
}
