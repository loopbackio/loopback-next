// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  inject,
  Provider,
  Interceptor,
  InvocationContext,
  Next,
} from '@loopback/core';
import {
  RestBindings,
  RequestContext,
  toInterceptor,
  ExpressRequestHandler,
} from '@loopback/rest';

export class FacebookOauthInterceptor implements Provider<Interceptor> {
  constructor(
    @inject('facebookStrategyMiddleware')
    public facebookStrategy: ExpressRequestHandler,
  ) {}

  value() {
    return async (invocationCtx: InvocationContext, next: Next) => {
      const requestCtx = invocationCtx.getSync<RequestContext>(
        RestBindings.Http.CONTEXT,
      );
      const request = requestCtx.request;
      if (request.query['oauth2-provider-name'] === 'facebook') {
        return toInterceptor(this.facebookStrategy)(invocationCtx, next);
      }
      return next();
    };
  }
}
