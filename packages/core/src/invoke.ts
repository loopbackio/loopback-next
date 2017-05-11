// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ServerResponse as Response} from 'http';
import {HandlerCallback} from './router/SwaggerRouter';

const debug = require('debug')('loopback:invoker');

// tslint:disable:no-any
export type OperationArgs = any[];
type OperationRetval = any;
// tslint:enable:no-any

export function invoke(
  controller: Object,
  operationName: string,
  args: OperationArgs,
  response: Response,
  next: HandlerCallback,
) {
  debug('invoke %s with arguments', operationName, args);

  // TODO(bajtos) support sync operations that return the value directly (no Promise)
  (controller as { [opName: string]: Function })[operationName](...args).then(
    function onSuccess(result: OperationRetval) {
      debug('%s() result -', operationName, result);
      // TODO(bajtos) handle non-string results via JSON.stringify
      if (result) {
        // TODO(ritch) remove this, should be configurable
        response.setHeader('Content-Type', 'application/json');
        // TODO(bajtos) handle errors - JSON.stringify can throw
        if (typeof result === 'object')
          result = JSON.stringify(result);
        response.write(result);
      }
      response.end();
      // Do not call next(), the request was handled.
    },
    function onError(err: Error) {
      debug('%s() failed - ', operationName, err.stack || err);
      next(err);
    });
}
