// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {LogError, Reject, HandlerContext} from '../types';
import {inject, Provider} from '@loopback/context';
import {HttpError} from 'http-errors';
import {writeErrorToResponse} from '../writer';
import {RestBindings} from '../keys';

const debug = require('debug')('loopback:rest:reject');

export class RejectProvider implements Provider<Reject> {
  constructor(
    @inject(RestBindings.SequenceActions.LOG_ERROR)
    protected logError: LogError,
  ) {}

  value(): Reject {
    return (context, error) => this.action(context, error);
  }

  action({request, response}: HandlerContext, error: Error) {
    const err = <HttpError>error;
    const statusCode = err.statusCode || err.status || 500;
    writeErrorToResponse(response, err);

    // Always log the error in debug mode, even when the application
    // has a custom error logger configured (e.g. in tests)
    debug(
      'HTTP request %s %s was rejected: %s %s',
      request.method,
      request.url,
      statusCode,
      err.stack || err,
    );
    this.logError(error, statusCode, request);
  }
}
