// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingScope, injectable, Provider} from '@loopback/core';
import {asMiddleware, Middleware} from '@loopback/express';
import {RestBindings, RestTags} from '../keys';
import {RestMiddlewareGroups} from '../sequence';
import {writeResultToResponse} from '../writer';
/**
 * Provides the function that populates the response object with
 * the results of the operation.
 *
 * @returns The handler function that will populate the
 * response with operation results.
 */

@injectable({scope: BindingScope.SINGLETON})
export class SendProvider {
  static value() {
    return writeResultToResponse;
  }
}

@injectable(
  asMiddleware({
    group: RestMiddlewareGroups.SEND_RESPONSE,
    downstreamGroups: [
      RestMiddlewareGroups.CORS,
      RestMiddlewareGroups.INVOKE_METHOD,
    ],
    chain: RestTags.REST_MIDDLEWARE_CHAIN,
  }),
  {scope: BindingScope.SINGLETON},
)
export class SendResponseMiddlewareProvider implements Provider<Middleware> {
  value(): Middleware {
    return async (ctx, next) => {
      const send = await ctx.get(RestBindings.SequenceActions.SEND);
      const reject = await ctx.get(RestBindings.SequenceActions.REJECT);
      try {
        /**
         * Invoke downstream middleware to produce the result
         */
        const result = await next();
        /**
         * Write the result to HTTP response
         */
        send(ctx.response, result);
      } catch (err) {
        /**
         * Write the error to HTTP response
         */
        reject(ctx, err);
      }
    };
  }
}
