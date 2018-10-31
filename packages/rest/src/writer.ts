// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {OperationRetval, Response} from './types';
import {Readable} from 'stream';
import {ResolvedRoute} from './router';
import {
  ResponseObject,
  ReferenceObject,
  OperationObject,
  isReferenceObject,
} from '@loopback/openapi-v3-types';
import {is} from 'type-is';

/**
 * Writes the result from Application controller method
 * into the HTTP response
 *
 * @param response HTTP Response
 * @param result Result from the API to write into HTTP Response
 */
export function writeResultToResponse(
  // not needed and responsibility should be in the sequence.send
  response: Response,
  // result returned back from invoking controller method
  result: OperationRetval,
  route?: ResolvedRoute,
): void {
  // Bypass response writing if the controller method returns `response` itself
  // or the response headers have been sent
  if (result === response || response.headersSent) {
    return;
  }
  if (result === undefined) {
    response.statusCode = 204;
    response.end();
    return;
  }

  let mediaType = undefined;
  if (route) {
    const responses = route.spec.responses;
    const responseObject: ResponseObject =
      responses['200'] || responses['201'] || {};
    const content = responseObject.content || {};
    mediaType = Object.keys(content)[0];
  }

  const isStream =
    result instanceof Readable || typeof (result && result.pipe) === 'function';

  if (isStream) {
    response.setHeader('Content-Type', 'application/octet-stream');
    // Stream
    result.pipe(response);
    return;
  }
  switch (typeof result) {
    case 'object':
    case 'boolean':
    case 'number':
      if (Buffer.isBuffer(result)) {
        // Buffer for binary data
        response.setHeader('Content-Type', 'application/octet-stream');
      } else {
        // TODO(ritch) remove this, should be configurable
        // See https://github.com/strongloop/loopback-next/issues/436
        response.setHeader('Content-Type', 'application/json');
        // TODO(bajtos) handle errors - JSON.stringify can throw
        result = JSON.stringify(result);
      }
      break;
    default:
      response.setHeader('Content-Type', mediaType || 'text/plain');
      break;
  }
  response.end(result);
}

function getResponseObject(spec: OperationObject, statusCode: number | string) {
  statusCode = (statusCode || '200').toString();
  const responses = spec.responses || {};
  const responseObj: ResponseObject | ReferenceObject = responses[statusCode];
  if (isReferenceObject(responseObj)) {
    return;
  }
  if (responseObj) return responseObj;
  return responses.default;
}

function getResponseMediaType(responseObject: ResponseObject, accept: string) {
  const content = responseObject.content || {};
  for (const mediaType in content) {
    if (is(mediaType, accept)) {
      return {
        mediaType,
        mediaTypeObject: content[mediaType],
      };
    }
  }
  return undefined;
}
/**
 * Interface to be implemented by response writer extensions
 */
export interface ResponseWriter {
  /**
   * Optional name of the parser for debugging
   */
  name?: string;
  /**
   * Indicate if the given media type is supported
   * @param mediaType Media type
   */
  supports(mediaType: string): boolean;
  /**
   * Parse the request body
   * @param request http request
   */
  // tslint:disable-next-line:no-any
  write(response: Response, result: any): Promise<void>;
}

/**
 * Interface to be implemented by error writer extensions
 */
export interface ErrorResponseWriter {
  /**
   * Optional name of the parser for debugging
   */
  name?: string;
  /**
   * Indicate if the given media type is supported
   * @param mediaType Media type
   */
  supports(mediaType: string): boolean;
  /**
   * Parse the request body
   * @param request http request
   */
  write(response: Response, error: Error): Promise<void>;
}
