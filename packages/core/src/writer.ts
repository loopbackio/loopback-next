// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ServerResponse as Response} from 'http';
import {OperationRetval} from './internal-types';

export function writeResultToResponse(
  // not needed and responsibility should be in the sequence.send
  response: Response,
  // result returned back from invoking controller method
  result: OperationRetval,
): void {
  if (result) {
    if (typeof result === 'object') {
      // TODO(ritch) remove this, should be configurable
      response.setHeader('Content-Type', 'application/json');
      // TODO(bajtos) handle errors - JSON.stringify can throw
      result = JSON.stringify(result);
    } else if (typeof result === 'string') {
      response.setHeader('Content-Type', 'text/plain');
    }
    response.write(result);
  }
  response.end();
}
