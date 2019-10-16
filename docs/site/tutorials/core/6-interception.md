---
lang: en
title: 'Interception'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/core-tutorial-part6.html
---

Interception in LoopBack is inspired by
[aspect-oriented programming](https://en.wikipedia.org/wiki/Aspect-oriented_programming)
paradigm. Interceptors are reusable functions to provide aspect-oriented logic
around method invocations.

See more details in the
[Interceptor documentation page](https://loopback.io/doc/en/lb4/Interceptors.html).

## Caching service

In the
[Greeter Application](https://github.com/strongloop/loopback-next/tree/master/examples/greeting-app),
the
CachingService](https://github.com/strongloop/loopback-next/blob/master/examples/greeting-app/src/caching-service.ts)
is being used for REST level caching, which is a common requirement for REST
APIs. It uses the HTTP path URL as part of the caching key. If there are values
matching the caching keys, the corresponding value in the cache will be used.

## How is caching enforced

All HTT requests are being intercepted by the
[`CachingInterceptor`](https://github.com/strongloop/loopback-next/blob/master/examples/greeting-app/src/interceptors/caching.interceptor.ts).
As mentioned above, the CachingService is using the HTTP path URL, which we can
obtain from the `InvocationContext`, as part of the caching key. If no matching
caching key is found, it goes through the business logic for the HTTP endpoint.
As the post-invocation logic, the value will be stored in the cache.

See the following code example:

```ts
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
```

For complete code sample, see
[caching.intercepter.ts](https://github.com/strongloop/loopback-next/blob/master/examples/greeting-app/src/interceptors/caching.interceptor.ts).

FIXME: not sure what it is used for
https://github.com/strongloop/loopback-next/blob/master/examples/context/src/interceptor-proxy.ts
