// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject, Provider} from '@loopback/context';
import {HttpError} from 'http-errors';
import {ErrorWriterOptions, writeErrorToResponse} from 'strong-error-handler';
import {RestBindings} from '../keys';
import {HandlerContext, LogError, Reject} from '../types';

// TODO(bajtos) Make this mapping configurable at RestServer level,
// allow apps and extensions to contribute additional mappings.
const codeToStatusCodeMap: {[key: string]: number} = {
  ENTITY_NOT_FOUND: 404,
  INVALID_INCLUSION_FILTER: 400,
};

export class RejectProvider implements Provider<Reject> {
  constructor(
    @inject(RestBindings.SequenceActions.LOG_ERROR)
    protected logError: LogError,
    @inject(RestBindings.ERROR_WRITER_OPTIONS, {optional: true})
    protected errorWriterOptions?: ErrorWriterOptions,
  ) {}

  value(): Reject {
    return (context, error) => this.action(context, error);
  }

  action({request, response}: HandlerContext, error: Error) {
    const err = <HttpError>error;

    if (!err.status && !err.statusCode && err.code) {
      const customStatus = codeToStatusCodeMap[err.code];
      if (customStatus) {
        err.statusCode = customStatus;
      }
    }

    const statusCode = err.statusCode || err.status || 500;
    writeErrorToResponse(err, request, response, this.errorWriterOptions);
    this.logError(error, statusCode, request);
  }
}
