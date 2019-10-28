---
lang: en
title: 'Observation of life cycle events'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/core-tutorial-part7.html
---

There are life cycle events associated with an application, typically `start`
and `stop`.
[Life cycle observers](https://loopback.io/doc/en/lb4/Life-cycle.html) allows
various types of artifacts to participate in the application life cycles.

You can make use of the
[life cycle observer generator](https://loopback.io/doc/en/lb4/Life-cycle-observer-generator.html)
to create observers easily.

## How is cache maintained

In the
[CachingService](https://github.com/strongloop/loopback-next/blob/master/examples/greeting-app/src/caching-service.ts),
there is a time-to-live (ttl) setting for each cache items. That means when the
cache item is expired, it will be removed from the cache.

The life cycle observer provides a way to look at the in-memory caching as part
of the application life cycle and remove the ones that are expired. See the
[cache.observer.ts](https://github.com/strongloop/loopback-next/blob/master/examples/greeting-app/src/observers/cache.observer.ts)
as an example.

During the start of the application, the observer calls `CachingService.start()`
which does the sweeping periodically.

```ts
async start(): Promise<void> {
  debug('Starting caching service');
  await this.clear();
  const ttl = await this.getTTL();
  debug('TTL: %d', ttl);
  this.timer = setInterval(() => {
    this.sweep().catch(console.warn);
  }, ttl);
}
```

---

Previous: [Part 6 - Interception and observation](./6-interception.md)

Next: [Part 8 - Configuration](./8-configuration.md)
