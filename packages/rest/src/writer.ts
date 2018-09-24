// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {OperationRetval, Response} from './types';
import {Readable} from 'stream';

/**
 * Writes the result from Application controller method
 * into the HTTP response
 *
 * @param response HTTP Response
 * @param result Result from the API to write into HTTP Response
 * @param contentType Optional content type for the response
 */
export function writeResultToResponse(
  // not needed and responsibility should be in the sequence.send
  response: Response,
  // result returned back from invoking controller method
  result: OperationRetval,
  // content type for the response
  contentType?: string,
): void {
  // Check if response writing should be bypassed. When the return value
  // is the response object itself, no writing should happen.
  if (result === response) return;

  if (result === undefined) {
    response.status(204);
    response.end();
    return;
  }

  function setContentType(defaultType: string = 'application/json') {
    if (response.getHeader('Content-Type') == null) {
      response.setHeader('Content-Type', contentType || defaultType);
    }
  }

  if (
    result instanceof Readable ||
    typeof (result && result.pipe) === 'function'
  ) {
    setContentType('application/octet-stream');
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
        setContentType('application/octet-stream');
      } else {
        // TODO(ritch) remove this, should be configurable
        // See https://github.com/strongloop/loopback-next/issues/436
        setContentType();
        // TODO(bajtos) handle errors - JSON.stringify can throw
        result = JSON.stringify(result);
      }
      break;
    default:
      setContentType('text/plain');
      result = result.toString();
      break;
  }
  response.end(result);
}
