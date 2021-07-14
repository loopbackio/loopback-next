// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  inject,
  Provider,
  InvocationContext,
  Next,
  Interceptor,
} from '@loopback/core';
import {
  RestBindings,
  RequestContext,
  toInterceptor,
  ExpressRequestHandler,
} from '@loopback/rest';

export class CustomOauth2Interceptor implements Provider<Interceptor> {
  constructor(
    @inject('oauth2StrategyMiddleware')
    public oauth2Strategy: ExpressRequestHandler,
  ) {}

  value() {
    return async (invocationCtx: InvocationContext, next: Next) => {
      const requestCtx = invocationCtx.getSync<RequestContext>(
        RestBindings.Http.CONTEXT,
      );
      const request = requestCtx.request;
      if (request.query['oauth2-provider-name'] === 'oauth2') {
        return toInterceptor(this.oauth2Strategy)(invocationCtx, next);
      }
      return next();
    };
  }
}
