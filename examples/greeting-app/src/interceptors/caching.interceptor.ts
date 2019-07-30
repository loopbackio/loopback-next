// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-greeting-app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  asGlobalInterceptor,
  bind,
  inject,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/context';
import {RestBindings} from '@loopback/rest';
import * as debugFactory from 'debug';
import {CachingService} from '../caching-service';
import {CACHING_SERVICE} from '../keys';

const debug = debugFactory('greeter-extension');

@bind(asGlobalInterceptor('caching'))
export class CachingInterceptor implements Provider<Interceptor> {
  constructor(
    @inject(CACHING_SERVICE) private cachingService: CachingService,
  ) {}

  value() {
    return async (
      ctx: InvocationContext,
      next: () => ValueOrPromise<InvocationResult>,
    ) => {
      const httpReq = await ctx.get(RestBindings.Http.REQUEST, {
        optional: true,
      });
      /* istanbul ignore if */
      if (!httpReq) {
        // Not http request
        return next();
      }
      const key = httpReq.path;
      const lang = httpReq.acceptsLanguages(['en', 'zh']) || 'en';
      const cachingKey = `${lang}:${key}`;
      const cachedResult = await this.cachingService.get(cachingKey);
      if (cachedResult) {
        debug('Cache found for %s %j', cachingKey, cachedResult);
        return cachedResult;
      }
      const result = await next();
      await this.cachingService.set(cachingKey, result);
      return result;
    };
  }
}
