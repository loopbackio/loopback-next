// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingScope, inject, injectable} from '@loopback/core';
import {HttpError} from 'http-errors';
import {ErrorWriterOptions, writeErrorToResponse} from 'strong-error-handler';
import {RestBindings} from '../keys';
import {HandlerContext, LogError, Reject} from '../types';

// TODO(bajtos) Make this mapping configurable at RestServer level,
// allow apps and extensions to contribute additional mappings.
const codeToStatusCodeMap: {[key: string]: number} = {
  ENTITY_NOT_FOUND: 404,
};

@injectable({scope: BindingScope.SINGLETON})
export class RejectProvider {
  static value(
    @inject(RestBindings.SequenceActions.LOG_ERROR)
    logError: LogError,
    @inject(RestBindings.ERROR_WRITER_OPTIONS, {optional: true})
    errorWriterOptions?: ErrorWriterOptions,
  ): Reject {
    const reject: Reject = ({request, response}: HandlerContext, error) => {
      const err = <HttpError>error;

      if (!err.status && !err.statusCode && err.code) {
        const customStatus = codeToStatusCodeMap[err.code];
        if (customStatus) {
          err.statusCode = customStatus;
        }
      }

      const statusCode = err.statusCode || err.status || 500;
      writeErrorToResponse(err, request, response, errorWriterOptions);
      logError(error, statusCode, request);
    };
    return reject;
  }
}
