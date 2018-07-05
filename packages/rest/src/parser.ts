// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ServerRequest} from 'http';
import * as HttpErrors from 'http-errors';
import {
  OperationObject,
  ParameterObject,
  isReferenceObject,
  SchemasObject,
} from '@loopback/openapi-v3-types';
import {REQUEST_BODY_INDEX} from '@loopback/openapi-v3';
import {promisify} from 'util';
import {OperationArgs, Request, PathParameterValues} from './types';
import {ResolvedRoute} from './router/routing-table';
import {coerceParameter} from './coercion/coerce-parameter';
import {validateRequestBody} from './validation/request-body.validator';
import {RestHttpErrors} from './index';
type HttpError = HttpErrors.HttpError;
import * as debugModule from 'debug';
const debug = debugModule('loopback:rest:parser');

// tslint:disable-next-line:no-any
type MaybeBody = any | undefined;

const parseJsonBody: (req: ServerRequest) => Promise<MaybeBody> = promisify(
  require('body/json'),
);

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
 * @param operationSpec Swagger spec defined in the controller
 * @param pathParams Path parameters in incoming HTTP request
 */
export async function parseOperationArgs(
  request: Request,
  route: ResolvedRoute,
): Promise<OperationArgs> {
  debug('Parsing operation arguments for route %s', route.describe());
  const operationSpec = route.spec;
  const pathParams = route.pathParams;
  const body = await loadRequestBodyIfNeeded(operationSpec, request);
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
): Promise<MaybeBody> {
  if (!operationSpec.requestBody) return Promise.resolve();

  const contentType = getContentType(request);
  debug('Loading request body with content type %j', contentType);
  if (contentType && !/json/.test(contentType)) {
    throw new HttpErrors.UnsupportedMediaType(
      `Content-type ${contentType} is not supported.`,
    );
  }

  return await parseJsonBody(request).catch((err: HttpError) => {
    debug('Cannot parse request body %j', err);
    err.statusCode = 400;
    throw err;
  });
}

function buildOperationArguments(
  operationSpec: OperationObject,
  request: Request,
  pathParams: PathParameterValues,
  body: MaybeBody,
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

  if (requestBodyIndex > -1) paramArgs.splice(requestBodyIndex, 0, body);
  return paramArgs;
}

function getParamFromRequest(
  spec: ParameterObject,
  request: Request,
  pathParams: PathParameterValues,
) {
  let result;
  switch (spec.in) {
    case 'query':
      result = request.query[spec.name];
      break;
    case 'path':
      result = pathParams[spec.name];
      break;
    case 'header':
      // @jannyhou TBD: check edge cases
      result = request.headers[spec.name.toLowerCase()];
      break;
    // TODO(jannyhou) to support `cookie`,
    // see issue https://github.com/strongloop/loopback-next/issues/997
    default:
      throw RestHttpErrors.invalidParamLocation(spec.in);
  }
  return result;
}
