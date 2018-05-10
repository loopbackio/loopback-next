// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ServerRequest} from 'http';
import {LogError} from '..';

export function createUnexpectedHttpErrorLogger(
  expectedStatusCode: number = 0,
): LogError {
  return function logUnexpectedHttpError(
    err: Error,
    statusCode: number,
    req: ServerRequest,
  ) {
    if (statusCode === expectedStatusCode) return;

    console.error(
      'Unhandled error in %s %s: %s %s',
      req.method,
      req.url,
      statusCode,
      err.stack || err,
    );
  };
}
