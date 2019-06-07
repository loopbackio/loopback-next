// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject, Next} from '@loopback/context';
import {HttpError} from 'http-errors';
import {ErrorWriterOptions, writeErrorToResponse} from 'strong-error-handler';
import {RestBindings} from '../keys';
import {
  HandlerContext,
  HttpContext,
  LogError,
  Reject,
  restAction,
} from '../types';
import {BaseRestAction} from './base-action';

// TODO(bajtos) Make this mapping configurable at RestServer level,
// allow apps and extensions to contribute additional mappings.
const codeToStatusCodeMap: {[key: string]: number} = {
  ENTITY_NOT_FOUND: 404,
};

@restAction('reject')
export class RejectAction extends BaseRestAction {
  constructor(
    @inject(RestBindings.SequenceActions.LOG_ERROR)
    protected logError: LogError,
    @inject(RestBindings.ERROR_WRITER_OPTIONS, {optional: true})
    protected errorWriterOptions?: ErrorWriterOptions,
  ) {
    super();
  }

  async intercept(ctx: HttpContext, next: Next) {
    try {
      return await next();
    } catch (error) {
      await this.delegate(ctx, 'reject', [error]);
    }
  }

  reject(
    @inject(RestBindings.Http.CONTEXT) {request, response}: HandlerContext,
    error: Error,
  ) {
    const err = error as HttpError;
    if (!err.status && !err.statusCode && err.code) {
      const customStatus = codeToStatusCodeMap[err.code];
      if (customStatus) {
        err.statusCode = customStatus;
      }
    }
    const statusCode = err.statusCode || err.status || 500;
    writeErrorToResponse(err, request, response, this.errorWriterOptions);
    this.logError(err, statusCode, request);
  }

  get handler(): Reject {
    return this.reject.bind(this);
  }
}
