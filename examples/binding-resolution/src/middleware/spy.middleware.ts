// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-binding-resolution
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, Binding, Context, inject, Provider} from '@loopback/core';
import {asMiddleware, Middleware, RestMiddlewareGroups} from '@loopback/rest';
import {LOGGER_SERVICE} from '../keys';
import {bindingScope, logContext, logRequest, logContexts} from '../util';

@bind(
  asMiddleware({
    group: 'spy',
    upstreamGroups: RestMiddlewareGroups.AUTHENTICATION,
    downstreamGroups: RestMiddlewareGroups.INVOKE_METHOD,
  }),
  {tags: {name: 'Spy'}, scope: bindingScope()},
)
export class SpyMiddlewareProvider implements Provider<Middleware> {
  constructor(
    // Inject the resolution context and current binding for logging purpose
    @inject.context()
    resolutionCtx: Context,
    @inject.binding()
    private binding: Binding<unknown>,
  ) {
    logContexts(resolutionCtx, binding);
  }

  value(): Middleware {
    const spyMiddleware: Middleware = async (ctx, next) => {
      logContext('Request', ctx, this.binding);
      logRequest(ctx.request);

      // Switch to a request logger for the downstream `PingController`
      // This needs to happen before `invokeMethod` middleware so that
      // the controller instance is created with visibility to the bound
      // service within the request context. The controller binding scope
      // MUST NOT be `SINGLETON` to allow so.
      // NOTE: It will be too late to do so in an interceptor as interceptors
      // are invoked after the controller instance is resolved.
      ctx.bind(LOGGER_SERVICE).toAlias('services.RequestLoggerService');
      const result = await next();
      return result;
    };
    return spyMiddleware;
  }
}
