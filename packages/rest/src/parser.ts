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
import * as HttpErrors from 'http-errors';
import * as parseUrl from 'parseurl';
import {parse as parseQuery} from 'qs';
import {coerceParameter} from './coercion/coerce-parameter';
import {RestHttpErrors} from './rest-http-error';
import {ResolvedRoute} from './router';
import {
  OperationArgs,
  PathParameterValues,
  Request,
} from './types';
import {validateRequestBody} from './validation/request-body.validator';

const debug = debugModule('loopback:rest:parser');

export const QUERY_NOT_PARSED = {};
Object.freeze(QUERY_NOT_PARSED);

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
  requestBodyParser: RequestBodyParser = new RequestBodyParser({}),
): Promise<OperationArgs> {
  debug('Parsing operation arguments for route %s', route.describe());
  const operationSpec = route.spec;
  const pathParams = route.pathParams;
  const body = await requestBodyParser.loadRequestBodyIfNeeded(
    operationSpec,
    request,
  );
  return buildOperationArguments(
    operationSpec,
    request,
    pathParams,
    body,
    route.schemas,
  );
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
