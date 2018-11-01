// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {REQUEST_BODY_INDEX} from '@loopback/openapi-v3';
import {
  isReferenceObject,
  OperationObject,
  ParameterObject,
  ReferenceObject,
  SchemaObject,
  SchemasObject,
} from '@loopback/openapi-v3-types';
import * as debugModule from 'debug';
import {IncomingMessage} from 'http';
import * as HttpErrors from 'http-errors';
import * as parseUrl from 'parseurl';
import {parse as parseQuery} from 'qs';
import {promisify} from 'util';
import {coerceParameter} from './coercion/coerce-parameter';
import {RestHttpErrors} from './rest-http-error';
import {ResolvedRoute} from './router';
import {
  OperationArgs,
  PathParameterValues,
  Request,
  RequestBodyParserOptions,
} from './types';
import {validateRequestBody} from './validation/request-body.validator';
import {is} from 'type-is';
import * as qs from 'qs';

type HttpError = HttpErrors.HttpError;

const debug = debugModule('loopback:rest:parser');

export const QUERY_NOT_PARSED = {};
Object.freeze(QUERY_NOT_PARSED);

// tslint:disable:no-any
export type RequestBody = {
  value: any | undefined;
  coercionRequired?: boolean;
  mediaType?: string;
  schema?: SchemaObject | ReferenceObject;
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
  return req.get('content-type');
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

function normalizeParsingError(err: HttpError) {
  debug('Cannot parse request body %j', err);
  if (!err.statusCode || err.statusCode >= 500) {
    err.statusCode = 400;
  }
  return err;
}

export async function loadRequestBodyIfNeeded(
  operationSpec: OperationObject,
  request: Request,
  options: RequestBodyParserOptions = {},
): Promise<RequestBody> {
  const requestBody: RequestBody = {
    value: undefined,
  };
  if (!operationSpec.requestBody) return Promise.resolve(requestBody);

  debug('Request body parser options: %j', options);

  const contentType = getContentType(request) || 'application/json';
  debug('Loading request body with content type %j', contentType);

  // the type of `operationSpec.requestBody` could be `RequestBodyObject`
  // or `ReferenceObject`, resolving a `$ref` value is not supported yet.
  if (isReferenceObject(operationSpec.requestBody)) {
    throw new Error('$ref requestBody is not supported yet.');
  }

  let content = operationSpec.requestBody.content || {};
  if (!Object.keys(content).length) {
    content = {
      // default to allow json and urlencoded
      'application/json': {schema: {type: 'object'}},
      'application/x-www-form-urlencoded': {schema: {type: 'object'}},
    };
  }

  // Check of the request content type matches one of the expected media
  // types in the request body spec
  let matchedMediaType: string | false = false;
  for (const type in content) {
    matchedMediaType = is(contentType, type);
    if (matchedMediaType) {
      requestBody.mediaType = type;
      requestBody.schema = content[type].schema;
      break;
    }
  }

  if (!matchedMediaType) {
    // No matching media type found, fail fast
    throw RestHttpErrors.unsupportedMediaType(
      contentType,
      Object.keys(content),
    );
  }

  if (is(matchedMediaType, 'urlencoded')) {
    try {
      const body = await parseFormBody(
        request,
        // use `qs` modules to handle complex objects
        Object.assign(
          {
            querystring: {
              parse: (str: string, cb: Function) => {
                cb(null, qs.parse(str));
              },
            },
          },
          options,
        ),
      );
      return Object.assign(requestBody, {
        // form parser returns an object without prototype
        // create a new copy to simplify shouldjs assertions
        value: Object.assign({}, body),
        // urlencoded body only provide string values
        // set the flag so that AJV can coerce them based on the schema
        coercionRequired: true,
      });
    } catch (err) {
      throw normalizeParsingError(err);
    }
  }

  if (is(matchedMediaType, 'json')) {
    try {
      const jsonBody = await parseJsonBody(request, options);
      requestBody.value = jsonBody;
      return requestBody;
    } catch (err) {
      throw normalizeParsingError(err);
    }
  }

  throw RestHttpErrors.unsupportedMediaType(matchedMediaType);
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
  validateRequestBody(body, operationSpec.requestBody, globalSchemas);

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
