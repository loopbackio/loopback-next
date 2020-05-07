// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, inject, Provider} from '@loopback/core';
import {asMiddleware, Middleware} from '@loopback/express';
import {RestBindings, RestTags} from '../keys';
import {RestMiddlewareGroups} from '../sequence';
import {Reject, Send} from '../types';
import {writeResultToResponse} from '../writer';
/**
 * Provides the function that populates the response object with
 * the results of the operation.
 *
 * @returns The handler function that will populate the
 * response with operation results.
 */
export class SendProvider implements Provider<Send> {
  value() {
    return writeResultToResponse;
  }
}

@bind(
  asMiddleware({
    group: RestMiddlewareGroups.SEND_RESPONSE,
    downstreamGroups: [
      RestMiddlewareGroups.CORS,
      RestMiddlewareGroups.INVOKE_METHOD,
    ],
    chain: RestTags.REST_MIDDLEWARE_CHAIN,
  }),
)
export class SendResponseMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @inject(RestBindings.SequenceActions.SEND)
    protected send: Send,
    @inject(RestBindings.SequenceActions.REJECT)
    protected reject: Reject,
  ) {}

  value(): Middleware {
    return async (ctx, next) => {
      try {
        /**
         * Invoke downstream middleware to produce the result
         */
        const result = await next();
        /**
         * Write the result to HTTP response
         */
        this.send(ctx.response, result);
      } catch (err) {
        /**
         * Write the error to HTTP response
         */
        this.reject(ctx, err);
      }
    };
  }
}
