// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Request} from 'express';
import {IncomingMessage} from 'http';

/**
 * Creates a Logger that logs an Error if the HTTP status code is not expected
 *
 * @param expectedStatusCode - HTTP status code that is expected
 */
export function createUnexpectedHttpErrorLogger(
  expectedStatusCode?: number,
): LogError {
  return function logUnexpectedHttpError(
    err: Error,
    statusCode: number,
    req: IncomingMessage,
  ) {
    if (statusCode === expectedStatusCode) return;

    /* istanbul ignore next */
    console.error(
      'Unhandled error in %s %s: %s %s',
      req.method,
      req.url,
      statusCode,
      err.stack ?? err,
    );
  };
}

type LogError = (err: Error, statusCode: number, request: Request) => void;
