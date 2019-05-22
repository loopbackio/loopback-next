# Dependency injection

Artifacts usually work together to implement the business logic. For example,
`GreetingService` depends on greeters for different languages, such as
`EnglishGreeter` and `ChineseGreeter`.

Common techniques of composition are to hard code the dependencies or locate the
dependent artifacts. For example:

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

- Constructor parameters
- Properties
- Method parameters
