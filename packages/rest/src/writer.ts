// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {OperationRetval, Response} from './types';
import {HttpError} from 'http-errors';
import {Readable} from 'stream';

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
): void {
  if (result) {
    if (result instanceof Readable || typeof result.pipe === 'function') {
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
        response.setHeader('Content-Type', 'text/plain');
        result = result.toString();
        break;
    }
    response.write(result);
  }
  response.end();
}

/**
 * Write an error into the HTTP response
 * @param response HTTP response
 * @param error Error
 */
export function writeErrorToResponse(response: Response, error: Error) {
  const e = <HttpError>error;
  const statusCode = (response.statusCode = e.statusCode || e.status || 500);
  if (e.headers) {
    // Set response headers for the error
    for (const h in e.headers) {
      response.setHeader(h, e.headers[h]);
    }
  }
  // Build an error object
  const errObj: Partial<HttpError> = {
    statusCode,
  };
  if (e.expose) {
    // Expose other properties if the `expose` flag is set to `true`
    for (const p in e) {
      if (
        p === 'headers' ||
        p === 'expose' ||
        p === 'status' ||
        p === 'statusCode'
      )
        continue;
      errObj[p] = e[p];
    }
  }
  response.setHeader('Content-Type', 'application/json');
  response.write(JSON.stringify(errObj));
  response.end();
}
