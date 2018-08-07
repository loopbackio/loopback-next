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
