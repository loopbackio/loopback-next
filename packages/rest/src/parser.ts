// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {REQUEST_BODY_INDEX} from '@loopback/openapi-v3';
import {
  isReferenceObject,
  OperationObject,
  ParameterObject,
  SchemasObject,
} from '@loopback/openapi-v3-types';
import * as debugModule from 'debug';
import {IncomingMessage} from 'http';
import * as HttpErrors from 'http-errors';
import * as parseUrl from 'parseurl';
import {parse as parseQuery} from 'qs';
import {promisify} from 'util';
import {coerceParameter} from './coercion/coerce-parameter';
import {RestHttpErrors} from './index';
import {ResolvedRoute} from './router/routing-table';
import {
  OperationArgs,
  PathParameterValues,
  Request,
  RequestBodyParserOptions,
} from './types';
import {validateRequestBody} from './validation/request-body.validator';

type HttpError = HttpErrors.HttpError;

const debug = debugModule('loopback:rest:parser');

export const QUERY_NOT_PARSED = {};
Object.freeze(QUERY_NOT_PARSED);

// tslint:disable:no-any
type RequestBody = {
  value: any | undefined;
  coercionRequired?: boolean;
};

const parseJsonBody: (
  req: IncomingMessage,
  options: {},
) => Promise<any> = promisify(require('body/json'));

const parseFormBody: (
  req: IncomingMessage,
  options: {},
) => Promise<any> = promisify(require('body/form'));

/**
 * Get the content-type header value from the request
 * @param req Http request
 */
function getContentType(req: Request): string | undefined {
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
 * @param route Resolved Route
 */
export async function parseOperationArgs(
  request: Request,
  route: ResolvedRoute,
  options: RequestBodyParserOptions = {},
): Promise<OperationArgs> {
  debug('Parsing operation arguments for route %s', route.describe());
  const operationSpec = route.spec;
  const pathParams = route.pathParams;
  const body = await loadRequestBodyIfNeeded(operationSpec, request, options);
  return buildOperationArguments(
    operationSpec,
    request,
    pathParams,
    body,
    route.schemas,
  );
}

async function loadRequestBodyIfNeeded(
  operationSpec: OperationObject,
  request: Request,
  options: RequestBodyParserOptions = {},
): Promise<RequestBody> {
  if (!operationSpec.requestBody) return Promise.resolve({value: undefined});

  debug('Request body parser options: %j', options);

  const contentType = getContentType(request);
  debug('Loading request body with content type %j', contentType);

  if (
    contentType &&
    contentType.startsWith('application/x-www-form-urlencoded')
  ) {
    const body = await parseFormBody(request, options).catch(
      (err: HttpError) => {
        debug('Cannot parse request body %j', err);
        if (!err.statusCode || err.statusCode >= 500) {
          err.statusCode = 400;
        }
        throw err;
      },
    );
    // form parser returns an object with prototype
    return {
      value: Object.assign({}, body),
      coercionRequired: true,
    };
  }

  if (contentType && !/json/.test(contentType)) {
    throw new HttpErrors.UnsupportedMediaType(
      `Content-type ${contentType} is not supported.`,
    );
  }

  const jsonBody = await parseJsonBody(request, options).catch(
    (err: HttpError) => {
      debug('Cannot parse request body %j', err);
      if (!err.statusCode || err.statusCode >= 500) {
        err.statusCode = 400;
      }
      throw err;
    },
  );
  return {value: jsonBody};
}

function buildOperationArguments(
  operationSpec: OperationObject,
  request: Request,
  pathParams: PathParameterValues,
  body: RequestBody,
  globalSchemas: SchemasObject,
): OperationArgs {
  let requestBodyIndex: number = -1;
  if (operationSpec.requestBody) {
    // the type of `operationSpec.requestBody` could be `RequestBodyObject`
    // or `ReferenceObject`, resolving a `$ref` value is not supported yet.
    if (isReferenceObject(operationSpec.requestBody)) {
      throw new Error('$ref requestBody is not supported yet.');
    }
    const i = operationSpec.requestBody[REQUEST_BODY_INDEX];
    requestBodyIndex = i ? i : 0;
  }

  const paramArgs: OperationArgs = [];

  for (const paramSpec of operationSpec.parameters || []) {
    if (isReferenceObject(paramSpec)) {
      // TODO(bajtos) implement $ref parameters
      // See https://github.com/strongloop/loopback-next/issues/435
      throw new Error('$ref parameters are not supported yet.');
    }
    const spec = paramSpec as ParameterObject;
    const rawValue = getParamFromRequest(spec, request, pathParams);
    const coercedValue = coerceParameter(rawValue, spec);
    paramArgs.push(coercedValue);
  }

  debug('Validating request body - value %j', body);
  validateRequestBody(body.value, operationSpec.requestBody, globalSchemas, {
    coerceTypes: body.coercionRequired,
  });

  if (requestBodyIndex > -1) paramArgs.splice(requestBodyIndex, 0, body.value);
  return paramArgs;
}

function getParamFromRequest(
  spec: ParameterObject,
  request: Request,
  pathParams: PathParameterValues,
) {
  switch (spec.in) {
    case 'query':
      ensureRequestQueryWasParsed(request);
      return request.query[spec.name];
    case 'path':
      return pathParams[spec.name];
    case 'header':
      // @jannyhou TBD: check edge cases
      return request.headers[spec.name.toLowerCase()];
      break;
    // TODO(jannyhou) to support `cookie`,
    // see issue https://github.com/strongloop/loopback-next/issues/997
    default:
      throw RestHttpErrors.invalidParamLocation(spec.in);
  }
}

function ensureRequestQueryWasParsed(request: Request) {
  if (request.query && request.query !== QUERY_NOT_PARSED) return;

  const input = parseUrl(request)!.query;
  if (input && typeof input === 'string') {
    request.query = parseQuery(input);
  } else {
    request.query = {};
  }
  debug('Parsed request query: ', request.query);
}
