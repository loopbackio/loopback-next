// Copyright IBM Corp. and LoopBack contributors 2017,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  isReferenceObject,
  OperationObject,
  ParameterObject,
  REQUEST_BODY_INDEX,
  SchemasObject,
} from '@loopback/openapi-v3';
import debugFactory from 'debug';
import {RequestBody, RequestBodyParser} from './body-parsers';
import {coerceParameter} from './coercion/coerce-parameter';
import {RestHttpErrors} from './rest-http-error';
import {ResolvedRoute} from './router';
import {
  OperationArgs,
  PathParameterValues,
  Request,
  ValidationOptions,
} from './types';
import {DEFAULT_AJV_VALIDATION_OPTIONS} from './validation/ajv-factory.provider';
import {validateRequestBody} from './validation/request-body.validator';
const debug = debugFactory('loopback:rest:parser');

/**
 * Parses the request to derive arguments to be passed in for the Application
 * controller method
 *
 * @param request - Incoming HTTP request
 * @param route - Resolved Route
 */
export async function parseOperationArgs(
  request: Request,
  route: ResolvedRoute,
  requestBodyParser: RequestBodyParser = new RequestBodyParser(),
  options: ValidationOptions = DEFAULT_AJV_VALIDATION_OPTIONS,
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
    options,
  );
}

async function buildOperationArguments(
  operationSpec: OperationObject,
  request: Request,
  pathParams: PathParameterValues,
  body: RequestBody,
  globalSchemas: SchemasObject,
  options: ValidationOptions = DEFAULT_AJV_VALIDATION_OPTIONS,
): Promise<OperationArgs> {
  let requestBodyIndex = -1;
  if (operationSpec.requestBody) {
    // the type of `operationSpec.requestBody` could be `RequestBodyObject`
    // or `ReferenceObject`, resolving a `$ref` value is not supported yet.
    if (isReferenceObject(operationSpec.requestBody)) {
      throw new Error('$ref requestBody is not supported yet.');
    }
    const i = operationSpec.requestBody[REQUEST_BODY_INDEX];
    requestBodyIndex = i ?? 0;
  }

  const paramArgs: OperationArgs = [];

  for (const paramSpec of operationSpec.parameters ?? []) {
    if (isReferenceObject(paramSpec)) {
      // TODO(bajtos) implement $ref parameters
      // See https://github.com/loopbackio/loopback-next/issues/435
      throw new Error('$ref parameters are not supported yet.');
    }
    const spec = paramSpec as ParameterObject;
    const rawValue = getParamFromRequest(spec, request, pathParams);
    const coercedValue = await coerceParameter(rawValue, spec, options);
    paramArgs.push(coercedValue);
  }

  debug('Validating request body - value %j', body);
  await validateRequestBody(
    body,
    operationSpec.requestBody,
    globalSchemas,
    options,
  );

  if (requestBodyIndex >= 0) {
    paramArgs.splice(requestBodyIndex, 0, body.value);
  }
  return paramArgs;
}

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
      // @jannyhou TBD: check edge cases
      return request.headers[spec.name.toLowerCase()];
    // TODO(jannyhou) to support `cookie`,
    // see issue https://github.com/loopbackio/loopback-next/issues/997
    default:
      throw RestHttpErrors.invalidParamLocation(spec.in);
  }
}
