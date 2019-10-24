---
lang: en
title: 'Dependency injection'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/core-tutorial-part4.html
---

Artifacts usually work together to implement the business logic. For example,
[`GreetingService`](https://github.com/strongloop/loopback-next/blob/master/examples/greeter-extension/src/greeting-service.ts)
depends on greeters for different languages, such as
[`EnglishGreeter`](https://github.com/strongloop/loopback-next/blob/master/examples/greeter-extension/src/greeters/greeter-en.ts)
and
[`ChineseGreeter`](https://github.com/strongloop/loopback-next/blob/master/examples/greeter-extension/src/greeters/greeter-cn.ts).

Common techniques of composition include hard coding the dependencies or
locating the dependent artifacts. For example:

1. Hard code dependencies and explicitly instantiate them

   ```ts
   import {EnglishGreeter, ChineseGreeter} from './greeters';
   export class GreetingService {
     private chineseGreeter: ChineseGreeter;
     private englishGreeter: EnglishGreeter;
     constructor() {
       this.chineseGreeter = new ChineseGreeter();
       this.englishGreeter = new EnglishGreeter();
     }
   }
   ```

2. Use `ServiceLocator` pattern

   ```ts
   import {Context} from '@loopback/context';
   import {EnglishGreeter, ChineseGreeter} from './greeters';
   export class GreetingService {
     private chineseGreeter: ChineseGreeter;
     private englishGreeter: EnglishGreeter;
     constructor(context: Context) {
       this.chineseGreeter = context.getSync<ChineseGreeter>(
         'greeters.ChineseGreeter',
       );
       this.englishGreeter = context.getSync<EnglishGreeter>(
         'greeters.EnglishGreeter',
       );
     }
   }
   ```

3. Use dependency injection

   [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection) is
   a technique where the construction of dependencies of a class or function is
   separated from its behavior, in order to keep the code loosely coupled.

   This technique is being used commonly within the LoopBack framework.

   ```ts
   import {inject} from '@loopback/context';
   import {LifeCycleObserver} from '@loopback/core';
   import {CachingService} from '../caching-service';
   import {CACHING_SERVICE} from '../keys';
   export class CacheObserver implements LifeCycleObserver {
     constructor(
       @inject(CACHING_SERVICE) private cachingService: CachingService,
     ) {}
   }
   ```

   ```ts
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
         // ...
       };
     }
   }
   ```

## Types of dependency injections

There are 3 types of dependency injections:

- Constructor injection
- Property injection
- Method injection

For more details, see the
[dependency injection page](https://loopback.io/doc/en/lb4/Dependency-injection.html#flavors-of-dependency-injection).

---

Previous: [Part 3 - Manage artifacts](./3-context-in-action.md)

Next: [Part 5 - Extension point and extension](./5-extension-point-extension.md)
